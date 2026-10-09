import { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';
import { useGeolocation } from './hooks/useGeolocation.js';
import SearchForm from './components/SearchForm.jsx';
import CurrentWeatherCard from './components/CurrentWeatherCard.jsx';
import FiveDayForecast from './components/FiveDayForecast.jsx';
import GeolocationBadge from './components/GeolocationBadge.jsx';
import FavoritesBar from './components/FavoritesBar.jsx';

/**
 * Root shell — orchestration & state only (State/Business Logic Layer).
 */
export default function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [unit, setUnit] = useState(() => localStorage.getItem('wd_unit') || 'C');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const geo = useGeolocation();

  const currentCity = weather?.city?.toLowerCase() || '';
  const isFavorite = favorites.some((f) => f.city === currentCity);

  /* ---------- data loaders ---------- */

  const loadHistory = useCallback(() => {
    api.history().then(setHistory).catch(() => setHistory([]));
  }, []);

  const loadFavorites = useCallback(() => {
    api.favorites().then(setFavorites).catch(() => setFavorites([]));
  }, []);

  useEffect(() => {
    loadHistory();
    loadFavorites();
  }, [loadHistory, loadFavorites]);

  useEffect(() => {
    localStorage.setItem('wd_unit', unit);
  }, [unit]);

  /* ---------- core search flow ---------- */

  const loadWeather = useCallback(async (target) => {
    setLoading(true);
    setError(null);
    try {
      const [current, fiveDay] = await Promise.all([api.currentWeather(target), api.forecast(target)]);
      setWeather(current);
      setForecast(fiveDay);
      loadHistory();
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  }, [loadHistory]);

  // Load Pune on first visit so the dashboard is never blank
  useEffect(() => {
    loadWeather({ city: 'Pune' });
  }, [loadWeather]);

  // When geolocation resolves, auto-load the user's weather
  useEffect(() => {
    if (geo.status === 'granted' && geo.coords) loadWeather({ coords: geo.coords });
  }, [geo.status, geo.coords, loadWeather]);

  /* ---------- favorites ---------- */

  async function toggleFavorite() {
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
      setError(err.message);
    }
  }

  async function removeFavorite(city) {
    try {
      await api.removeFavorite(city);
      setFavorites((list) => list.filter((f) => f.city !== city));
    } catch (err) {
      setError(err.message);
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

  /* ---------- render ---------- */

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="brand-icon" aria-hidden="true">⛅</span>
          <div>
            <h1>Weather Dashboard</h1>
            <p className="tagline">Real-time forecasts powered by MERN + OpenWeatherMap</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-unit"
          onClick={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
          aria-label={`Switch to degrees ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
        >
          °{unit === 'C' ? 'F' : 'C'}
        </button>
      </header>

      <main>
        <SearchForm onSearch={(city) => loadWeather({ city })} history={history} onClearHistory={clearHistory} loading={loading} />
        <GeolocationBadge geo={geo} onLocate={geo.locate} />
        <FavoritesBar favorites={favorites} onSelect={(city) => loadWeather({ city })} onRemove={removeFavorite} />

        {error && (
          <div className="error-banner" role="alert">
            ⚠️ {error}
            <button type="button" className="error-close" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {loading && !weather && <div className="skeleton skeleton-card" aria-label="Loading" />}
        {loading && weather && <div className="loading-bar" aria-hidden="true" />}

        {!loading && !weather && !error && (
          <div className="empty-state">
            <p>🌤️ Search for a city or use your location to see the weather.</p>
          </div>
        )}

        {weather && (
          <div className="dashboard-grid">
            <CurrentWeatherCard
              weather={weather}
              unit={unit}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
            {loading && <div className="skeleton skeleton-forecast" aria-label="Loading forecast" />}
            {!loading && <FiveDayForecast forecast={forecast} unit={unit} />}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Week 4 · Project 2 · ICP-2AA73905-2026 · Data by{' '}
          <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">OpenWeatherMap</a>
        </p>
      </footer>
    </div>
  );
}
