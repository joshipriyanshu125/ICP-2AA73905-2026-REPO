import { formatClock } from '../hooks/useGeolocation.js';

/**
 * 2 × 3 grid of stat tiles beside the hero:
 * humidity, wind, pressure, visibility, sunrise, sunset.
 */
export default function StatTiles({ weather }) {
  if (!weather) return null;

  return (
    <div className="stat-tiles" aria-label="Weather details">
      <div className="card stat-tile">
        <p className="stat-tile__label"><span aria-hidden="true">💧</span> Humidity</p>
        <p className="stat-tile__value">{weather.humidity}<small>%</small></p>
      </div>

      <div className="card stat-tile">
        <p className="stat-tile__label"><span aria-hidden="true">💨</span> Wind</p>
        <p className="stat-tile__value">{weather.windSpeed}<small>m/s</small></p>
      </div>

      <div className="card stat-tile">
        <p className="stat-tile__label"><span aria-hidden="true">🧭</span> Pressure</p>
        <p className="stat-tile__value">{weather.pressure}<small>hPa</small></p>
      </div>

      <div className="card stat-tile">
        <p className="stat-tile__label"><span aria-hidden="true">👓</span> Visibility</p>
        <p className="stat-tile__value">{(weather.visibility / 1000).toFixed(1)}<small>km</small></p>
      </div>

      <div className="card stat-tile">
        <p className="stat-tile__label"><span aria-hidden="true">🌅</span> Sunrise</p>
        <p className="stat-tile__value stat-tile__value--sm">{formatClock(weather.sunrise)}</p>
      </div>

      <div className="card stat-tile">
        <p className="stat-tile__label"><span aria-hidden="true">🌇</span> Sunset</p>
        <p className="stat-tile__value stat-tile__value--sm">{formatClock(weather.sunset)}</p>
      </div>
    </div>
  );
}
