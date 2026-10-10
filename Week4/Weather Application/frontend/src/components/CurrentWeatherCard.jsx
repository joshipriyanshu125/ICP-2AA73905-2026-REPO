import { iconUrl, toFahrenheit } from '../hooks/useGeolocation.js';

/**
 * Hero card: large display temperature, condition, feels-like + high/low,
 * big condition icon, and favorite toggle. Sits left of the stat tiles.
 */
export default function CurrentWeatherCard({ weather, unit, highLow, isFavorite, onToggleFavorite, canFavorite }) {
  if (!weather) return null;
  const convert = (c) => (unit === 'F' ? toFahrenheit(c) : c);
  const temp = convert(weather.temperature);
  const feels = convert(weather.feelsLike);

  return (
    <article className="card hero" aria-label={`Current weather for ${weather.city}`}>
      <div className="hero__body">
        <header className="hero__head">
          <div>
            <h2 className="hero__city">
              {weather.city}
              {weather.country && <span className="hero__country">, {weather.country}</span>}
            </h2>
            <p className="hero__condition">
              <img src={iconUrl(weather.icon)} alt="" width="30" height="30" />
              {weather.description || weather.condition}
            </p>
          </div>
          <button
            type="button"
            className={`btn-fav ${isFavorite ? 'is-fav' : ''}`}
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            title={canFavorite ? (isFavorite ? 'Remove from favorites' : 'Save to favorites') : 'Sign in to save favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </header>

        <div className="hero__temp">
          <span className="temp-value">{temp}</span>
          <span className="temp-unit">°{unit}</span>
        </div>

        <p className="hero__meta">
          Feels like <strong>{feels}°{unit}</strong>
          {highLow && (
            <>
              {' '}· H <strong>{convert(highLow.high)}°</strong> / L <strong>{convert(highLow.low)}°</strong>
            </>
          )}
        </p>
      </div>

      <img
        className="hero__icon"
        src={iconUrl(weather.icon, '4x')}
        alt=""
        width="136"
        height="136"
        aria-hidden="true"
      />
    </article>
  );
}
