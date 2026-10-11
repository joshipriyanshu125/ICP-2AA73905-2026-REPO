/**
 * Shared threshold evaluation for the dashboard banner and saved-location
 * preview. Weather values are normalized to metric units by weatherService.
 */
export function evaluateWeatherAlerts({ current = {}, forecast = {} } = {}, settings = {}) {
  if (!settings.alertEnabled) return [];

  const minTemp = Number(settings.minTempAlert);
  const maxWind = Number(settings.maxWindAlert);
  const alerts = [];
  const city = current.city || forecast.city || 'Saved location';
  const detectedAt = new Date().toISOString();

  if (Number.isFinite(minTemp) && Number(current.temperature) < minTemp) {
    alerts.push({
      id: 'cold-current',
      type: 'cold',
      source: 'threshold',
      title: 'Temperature below threshold',
      message: `${city} is ${current.temperature}°C, below your ${minTemp}°C threshold.`,
      value: Number(current.temperature),
      threshold: minTemp,
      forecastFor: detectedAt.slice(0, 10),
      detectedAt
    });
  }

  const coldDay = (Array.isArray(forecast.days) ? forecast.days : [])
    .find((day) => Number(day.tempMin) < minTemp);
  if (Number.isFinite(minTemp) && coldDay) {
    alerts.push({
      id: `cold-forecast-${coldDay.date}`,
      type: 'cold-forecast',
      source: 'threshold',
      title: 'Cold forecast ahead',
      message: `${city} may fall to ${coldDay.tempMin}°C on ${coldDay.date}, below your ${minTemp}°C threshold.`,
      value: Number(coldDay.tempMin),
      threshold: minTemp,
      forecastFor: coldDay.date,
      detectedAt
    });
  }

  if (Number.isFinite(maxWind) && Number(current.windSpeed) > maxWind) {
    alerts.push({
      id: 'wind-current',
      type: 'wind',
      source: 'threshold',
      title: 'Wind above threshold',
      message: `${city} has ${current.windSpeed} m/s winds, above your ${maxWind} m/s threshold.`,
      value: Number(current.windSpeed),
      threshold: maxWind,
      forecastFor: detectedAt.slice(0, 10),
      detectedAt
    });
  }

  for (const official of Array.isArray(forecast.alerts) ? forecast.alerts : []) {
    alerts.push({
      id: `official-${official.event}-${official.start || 0}`,
      type: 'official',
      source: 'official',
      title: official.event || 'Weather warning',
      message: official.description || 'An official weather warning is active for this location.',
      value: null,
      threshold: null,
      forecastFor: official.start ? new Date(official.start * 1000).toISOString().slice(0, 10) : detectedAt.slice(0, 10),
      detectedAt,
      senderName: official.senderName || ''
    });
  }

  return alerts;
}

export function alertFingerprint(city, alert) {
  return [String(city).toLowerCase(), alert.type, alert.forecastFor || 'now'].join('|');
}
