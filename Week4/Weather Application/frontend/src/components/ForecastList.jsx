import { iconUrl, formatDay, relativeDay, toFahrenheit } from '../hooks/useGeolocation.js';

/**
 * Full-width daily forecast list with min — range bar — max rows
 * (5 days on the free OpenWeatherMap plan, 7 days with One Call 3.0).
 * The bar is positioned within the week's overall min/max range.
 */
export default function ForecastList({ forecast, unit }) {
  if (!forecast?.days?.length) return null;
  const convert = (c) => (unit === 'F' ? toFahrenheit(c) : c);
  const days = forecast.days;
  const count = days.length;

  const weekLow = Math.min(...days.map((d) => d.tempMin));
  const weekHigh = Math.max(...days.map((d) => d.tempMax));
  const span = Math.max(weekHigh - weekLow, 1);

  return (
    <section className="card forecast-section" aria-label={`${count}-day forecast`}>
      <h3 className="card-title">
        {count}-Day Forecast
        <span className="card-sub">
          {forecast.city}
          {forecast.country ? `, ${forecast.country}` : ''} · low—high range
        </span>
      </h3>

      <div className="forecast-list">
        {days.map((day) => {
          const relative = relativeDay(day.date);
          const left = ((day.tempMin - weekLow) / span) * 100;
          const width = ((day.tempMax - day.tempMin) / span) * 100;

          return (
            <article key={day.date} className="forecast-row">
              <div className="forecast-row__day">
                {formatDay(day.date).split(',')[0]}
                <small>{relative || formatDay(day.date).split(',').slice(1).join(',').trim()}</small>
              </div>

              <img className="forecast-row__icon" src={iconUrl(day.icon)} alt={day.condition} width="40" height="40" loading="lazy" />

              <div className="forecast-row__meta">{day.condition}</div>

              <div className="forecast-row__pop">{day.pop > 0 ? `💧 ${day.pop}%` : ''}</div>

              <div className="forecast-row__min">{convert(day.tempMin)}°</div>

              <div className="range-bar" aria-hidden="true">
                <span className="range-bar__fill" style={{ left: `${left}%`, width: `${Math.max(width, 5)}%` }} />
              </div>

              <div className="forecast-row__max">{convert(day.tempMax)}°</div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
