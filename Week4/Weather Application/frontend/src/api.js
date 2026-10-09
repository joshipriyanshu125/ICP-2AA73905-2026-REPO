/**
 * Centralized API client (Data Access Layer).
 * All network traffic goes through our Express backend —
 * the OpenWeatherMap key never reaches the browser.
 */
const BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
  } catch {
    const err = new Error('Network error — you appear to be offline.');
    err.status = 503;
    throw err;
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    /* non-JSON response */
  }

  if (!response.ok || body?.ok === false) {
    const err = new Error(body?.error || `Request failed (${response.status})`);
    err.status = response.status;
    throw err;
  }
  return body.data;
}

export const api = {
  currentWeather: (target) =>
    request(`/api/weather/current?${target.coords ? `lat=${target.coords.lat}&lon=${target.coords.lon}` : `city=${encodeURIComponent(target.city)}`}`),
  forecast: (target) =>
    request(`/api/weather/forecast?${target.coords ? `lat=${target.coords.lat}&lon=${target.coords.lon}` : `city=${encodeURIComponent(target.city)}`}`),
  history: () => request('/api/weather/history'),
  clearHistory: () => request('/api/weather/history', { method: 'DELETE' }),
  favorites: () => request('/api/weather/favorites'),
  addFavorite: (payload) =>
    request('/api/weather/favorites', { method: 'POST', body: JSON.stringify(payload) }),
  removeFavorite: (city) => request(`/api/weather/favorites/${encodeURIComponent(city)}`, { method: 'DELETE' })
};
