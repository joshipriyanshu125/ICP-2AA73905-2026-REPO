import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useGeolocation, conditionGroup } from '../hooks/useGeolocation.js';
import SearchForm from '../components/SearchForm.jsx';
import CurrentWeatherCard from '../components/CurrentWeatherCard.jsx';
import StatTiles from '../components/StatTiles.jsx';
import HourlyStrip from '../components/HourlyStrip.jsx';
import ForecastList from '../components/ForecastList.jsx';
import FavoritesBar from '../components/FavoritesBar.jsx';
import GeolocationBadge from '../components/GeolocationBadge.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

// recharts is heavy — split it into its own chunk
const ForecastCharts = lazy(() => import('../components/ForecastCharts.jsx'));

/* per-route head metadata (SPA equivalent of route-level meta) */
function setMeta(name, content) {
  let tag = document.head.querySelector(`meta[name="${name}"]`) ||
    document.head.querySelector(`meta[property="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const geo = useGeolocation();

  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [unit, setUnit] = useState(() => localStorage.getItem('wd_unit') || 'C');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentCity = weather?.city?.toLowerCase() || '';
  const isFavorite = favorites.some((f) => f.city === currentCity);

  // Today's high/low comes from the first forecast day
  const highLow =
    forecast?.days?.[0] != null
      ? { high: forecast.days[0].tempMax, low: forecast.days[0].tempMin }
      : null;

  /* ---------- head metadata ---------- */
  useEffect(() => {
    const title = weather
      ? `${weather.city}: ${weather.temperature}°C · ${weather.description || weather.condition} | Weather Dashboard`
      : 'Weather Dashboard — Live Forecasts, Charts & Saved Locations';
    document.title = title;
    setMeta('description', weather
      ? `Live weather for ${weather.city}${weather.country ? ', ' + weather.country : ''} — current conditions, 24-hour strip, forecast charts and saved locations.`
      : 'Real-time weather dashboard with current conditions, hourly and multi-day forecasts, charts, geolocation and saved favorite cities.');
    setMeta('og:title', title);
    setMeta('og:type', 'website');
  }, [weather]);

  /* ---------- condition-aware accent color ---------- */
  useEffect(() => {
    const group = conditionGroup(weather?.condition);
    if (group) document.documentElement.dataset.condition = group;
    else delete document.documentElement.dataset.condition;
  }, [weather?.condition]);

  /* ---------- data loaders ---------- */
  const loadHistory = useCallback(() => {
    api.history().then(setHistory).catch(() => setHistory([]));
  }, []);

  const loadFavorites = useCallback(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    api
      .favorites()
      .then(setFavorites)
      .catch((err) => {
        if (err.status === 401) setFavorites([]);
        else setFavorites([]);
      });
  }, [user]);

  useEffect(() => {
    loadHistory();
    loadFavorites();
  }, [loadHistory, loadFavorites]);

  useEffect(() => {
    localStorage.setItem('wd_unit', unit);
  }, [unit]);

  const loadWeather = useCallback(
    async (target) => {
      setLoading(true);
      setError(null);
      try {
        const [current, multiDay] = await Promise.all([api.currentWeather(target), api.forecast(target)]);
        setWeather(current);
        setForecast(multiDay);
        loadHistory();
      } catch (err) {
        setError(err.message || 'Failed to fetch weather data.');
      } finally {
        setLoading(false);
      }
    },
    [loadHistory]
  );

  // Real-time location on first visit — no hardcoded default city.
  // Silent if permission was already granted; prompts once otherwise.
  useEffect(() => {
    geo.locate();
  }, [geo.locate]);

  // When geolocation resolves, load the weather for the actual coordinates
  useEffect(() => {
    if (geo.status === 'granted' && geo.coords) loadWeather({ coords: geo.coords });
  }, [geo.status, geo.coords, loadWeather]);

  /* ---------- favorites ---------- */
  async function toggleFavorite() {
    if (!user) return navigate('/auth');
    if (!weather) return;
    try {
      if (isFavorite) {
        await api.removeFavorite(weather.city.toLowerCase());
        setFavorites((list) => list.filter((f) => f.city !== weather.city.toLowerCase()));
      } else {
        await api.addFavorite({ city: weather.city, country: weather.country, coords: weather.coords });
        loadFavorites();
      }
    } catch (err) {
      if (err.status === 401) navigate('/auth');
      else setError(err.message);
    }
  }

  async function removeFavorite(city) {
    try {
      await api.removeFavorite(city);
      setFavorites((list) => list.filter((f) => f.city !== city));
    } catch (err) {
      if (err.status === 401) navigate('/auth');
      else setError(err.message);
    }
  }

  async function clearHistory() {
    try {
      await api.clearHistory();
      setHistory([]);
    } catch (err) {
      setError(err.message);
    }
  }

  const initials = user ? user.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '';

  // True while we wait for the real-time location fix (before any data exists)
  const awaitingLocation = !weather && ['idle', 'locating', 'granted'].includes(geo.status);

  /* ---------- render ---------- */
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="brand-mark" aria-hidden="true">⛅</span>
          <div>
            <h1>Weather Dashboard</h1>
            <p className="tagline">Live forecasts · charts · saved locations — MERN + OpenWeatherMap</p>
          </div>
        </Link>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-unit"
            onClick={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
            aria-label={`Switch to degrees ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
          >
            °{unit === 'C' ? 'F' : 'C'}
          </button>
          <ThemeToggle />
          {user ? (
            <button type="button" className="auth-link" onClick={logout} title="Sign out">
              <span className="avatar" aria-hidden="true">{initials}</span>
              <span>{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <Link to="/auth" className="auth-link">Sign in</Link>
          )}
        </div>
      </header>

      <main>
        <SearchForm
          onSearch={loadWeather}
          history={history}
          onClearHistory={clearHistory}
          loading={loading}
          extra={<GeolocationBadge geo={geo} onLocate={geo.locate} />}
        />
        <FavoritesBar
          favorites={favorites}
          signedIn={!!user}
          onSelect={loadWeather}
          onRemove={removeFavorite}
        />

        {error && (
          <div className="error-banner" role="alert">
            ⚠️ {error}
            <button type="button" className="error-close" onClick={() => setError(null)} aria-label="Dismiss">×</button>
          </div>
        )}

        {/* Waiting for the real-time location fix → skeleton, not fake data */}
        {!loading && !weather && !error && awaitingLocation && (
          <div className="conditions-row">
            <div className="skeleton skeleton-card" aria-label="Locating you" />
            <div className="skeleton skeleton-card" aria-label="Locating you" />
          </div>
        )}
        {loading && weather && <div className="loading-bar" aria-hidden="true" />}

        {/* Location unavailable/denied → prompt to search instead */}
        {!loading && !weather && !error && !awaitingLocation && (
          <div className="notice">
            <strong>🌤️ Search for a city</strong> or tap “Use my location” to see live weather, charts and forecasts.
          </div>
        )}

        {weather && (
          <>
            <div className="conditions-row">
              <CurrentWeatherCard
                weather={weather}
                unit={unit}
                highLow={highLow}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                canFavorite={!!user}
              />
              <StatTiles weather={weather} />
            </div>

            {!loading && (
              <>
                <div className="hourly-section">
                  <HourlyStrip hourly={forecast?.hourly} unit={unit} />
                </div>
                <Suspense fallback={<div className="skeleton skeleton-wide" aria-label="Loading charts" />}>
                  <ForecastCharts hourly={forecast?.hourly} days={forecast?.days} unit={unit} />
                </Suspense>
                <ForecastList forecast={forecast} unit={unit} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
