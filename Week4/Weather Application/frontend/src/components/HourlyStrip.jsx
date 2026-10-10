import { iconUrl, formatHour, toFahrenheit } from '../hooks/useGeolocation.js';

/**
 * Next-24h hourly strip (3-hour intervals from the forecast API).
 */
export default function HourlyStrip({ hourly, unit }) {
  if (!hourly?.length) return null;
  const convert = (c) => (unit === 'F' ? toFahrenheit(c) : c);

  return (
    <section className="card" aria-label="Hourly forecast">
      <h3 className="card-title">
        Next 24 Hours
        <span className="card-sub">3-hour intervals</span>
      </h3>
      <div className="hourly-scroll">
        {hourly.map((h) => (
          <article key={h.dt} className="hourly-item">
            <p className="hourly-item__time">{formatHour(h.dt)}</p>
            <img className="hourly-item__icon" src={iconUrl(h.icon)} alt={h.condition} width="36" height="36" loading="lazy" />
            <p className="hourly-item__temp">{convert(h.temp)}°</p>
            <p className="hourly-item__pop">{h.pop > 0 ? `💧 ${h.pop}%` : ''}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
