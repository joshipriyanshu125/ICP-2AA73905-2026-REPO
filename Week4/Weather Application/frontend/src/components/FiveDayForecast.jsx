import { iconUrl, conditionEmoji, formatDay, toFahrenheit } from '../hooks/useGeolocation.js';

/**
 * 5-day forecast grid (derived from OpenWeatherMap's 3-hour payload
 * by the backend's aggregateDaily function).
 */
export default function FiveDayForecast({ forecast, unit }) {
  if (!forecast?.days?.length) return null;

  const convert = (c) => (unit === 'F' ? toFahrenheit(c) : c);

  return (
    <section className="forecast" aria-label="5-day forecast">
      <h3 className="forecast__title">
        5-Day Forecast
        <span className="forecast__city">{forecast.city}{forecast.country && `, ${forecast.country}`}</span>
      </h3>
      <div className="forecast__grid">
        {forecast.days.map((day) => (
          <article key={day.date} className="forecast-card">
            <p className="forecast-card__day">{formatDay(day.date)}</p>
            <img src={iconUrl(day.icon)} alt={day.condition} width="44" height="44" loading="lazy" />
            <p className="forecast-card__emoji" aria-hidden="true">{conditionEmoji(day.condition)}</p>
            <p className="forecast-card__temps">
              <strong>{convert(day.tempMax)}°</strong> / {convert(day.tempMin)}°
            </p>
            <p className="forecast-card__meta">{day.humidity}% hum · {day.pop}% rain</p>
            <p className="forecast-card__cond">{day.condition}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
