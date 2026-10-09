import { iconUrl, conditionEmoji, toFahrenheit } from '../hooks/useGeolocation.js';

/**
 * Hero card: temperature, condition, humidity, wind, pressure, visibility.
 */
export default function CurrentWeatherCard({ weather, unit, isFavorite, onToggleFavorite }) {
  if (!weather) return null;
  const temp = unit === 'F' ? toFahrenheit(weather.temperature) : weather.temperature;
  const feels = unit === 'F' ? toFahrenheit(weather.feelsLike) : weather.feelsLike;

  return (
    <article className="weather-card" aria-label={`Current weather for ${weather.city}`}>
      <header className="weather-card__head">
        <div>
          <h2 className="weather-card__city">
            {weather.city}
            {weather.country && <span className="weather-card__country">, {weather.country}</span>}
          </h2>
          <p className="weather-card__condition">
            <img src={iconUrl(weather.icon)} alt="" width="28" height="28" />
            {conditionEmoji(weather.condition)} {weather.description || weather.condition}
          </p>
        </div>
        <button
          type="button"
          className={`btn-fav ${isFavorite ? 'is-fav' : ''}`}
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </header>

      <div className="weather-card__temp">
        <span className="temp-value">{temp}</span>
        <span className="temp-unit">°{unit}</span>
      </div>
      <p className="weather-card__feels">Feels like {feels}°{unit}</p>

      <dl className="weather-stats">
        <div className="stat">
          <dt>Humidity</dt>
          <dd>{weather.humidity}%</dd>
        </div>
        <div className="stat">
          <dt>Wind</dt>
          <dd>{weather.windSpeed} m/s</dd>
        </div>
        <div className="stat">
          <dt>Pressure</dt>
          <dd>{weather.pressure} hPa</dd>
        </div>
        <div className="stat">
          <dt>Visibility</dt>
          <dd>{(weather.visibility / 1000).toFixed(1)} km</dd>
        </div>
      </dl>
    </article>
  );
}
