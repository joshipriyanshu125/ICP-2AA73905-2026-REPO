/**
 * Severe-weather alert banner — sits at the top of the dashboard.
 *
 * Two sources:
 * 1. Official warnings from OpenWeatherMap One Call 3.0 (`forecast.alerts`)
 *    — present only when the API key is subscribed to One Call 3.0.
 * 2. Custom threshold alerts from the signed-in user's preferences
 *    (min temp / max wind) — evaluated against the current conditions.
 *
 * Renders nothing when there is nothing to warn about.
 */

function formatWindow(start, end) {
  if (!start) return '';
  const fmt = (x) =>
    new Date(x * 1000).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

export default function AlertBanner({ alerts, weather, settings, signedIn }) {
  const official = Array.isArray(alerts) ? alerts : [];
  const custom = [];

  if (signedIn && settings?.alertEnabled && weather) {
    const minTemp = Number(settings.minTempAlert);
    const maxWind = Number(settings.maxWindAlert);

    if (Number.isFinite(minTemp) && weather.temperature < minTemp) {
      custom.push({
        id: 'cold',
        icon: '🥶',
        text: `Temperature ${weather.temperature}°C is below your ${minTemp}°C alert threshold.`
      });
    }
    if (Number.isFinite(maxWind) && weather.windSpeed > maxWind) {
      custom.push({
        id: 'wind',
        icon: '💨',
        text: `Wind ${weather.windSpeed} m/s exceeds your ${maxWind} m/s alert threshold.`
      });
    }
  }

  if (!official.length && !custom.length) return null;

  return (
    <div className="alerts" role="region" aria-label="Weather alerts">
      {official.map((alert, i) => (
        <article className="alert alert--official" key={`o${i}`}>
          <span className="alert-icon" aria-hidden="true">⚠️</span>
          <div className="alert-body">
            <p className="alert-title">
              <strong>{alert.event}</strong>
              <span className="alert-meta">
                {alert.senderName ? ` · ${alert.senderName}` : ''}
                {alert.start ? ` · ${formatWindow(alert.start, alert.end)}` : ''}
              </span>
            </p>
            {alert.description && (
              <p className="alert-desc" title={alert.description}>
                {alert.description}
              </p>
            )}
          </div>
        </article>
      ))}

      {custom.map((alert) => (
        <article className={`alert alert--custom alert--${alert.id}`} key={alert.id}>
          <span className="alert-icon" aria-hidden="true">{alert.icon}</span>
          <div className="alert-body">
            <p className="alert-title">
              <strong>Custom alert</strong>
              <span className="alert-meta"> · from your alert settings</span>
            </p>
            <p className="alert-desc">{alert.text}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
