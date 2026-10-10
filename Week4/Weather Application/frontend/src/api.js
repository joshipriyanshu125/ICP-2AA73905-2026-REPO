/**
 * Centralized API client (Data Access Layer).
 * All traffic goes through our Express backend — the OpenWeatherMap key
 * never reaches the browser. JWT is attached automatically when present.
 */
const BASE = import.meta.env.VITE_API_BASE_URL || '';
const TOKEN_KEY = 'wd_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE}${path}`, { ...options, headers });
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

const qs = (params) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

export const api = {
  /* ---------- weather ---------- */
  currentWeather: (target) =>
    request(`/api/weather/current?${target.coords ? qs({ lat: target.coords.lat, lon: target.coords.lon }) : qs({ city: target.city })}`),
  forecast: (target) =>
    request(`/api/weather/forecast?${target.coords ? qs({ lat: target.coords.lat, lon: target.coords.lon }) : qs({ city: target.city })}`),
  searchCities: (q) => request(`/api/weather/search?${qs({ q })}`),

  /* ---------- history (public) ---------- */
  history: () => request('/api/weather/history'),
  clearHistory: () => request('/api/weather/history', { method: 'DELETE' }),

  /* ---------- favorites (authenticated) ---------- */
  favorites: () => request('/api/weather/favorites'),
  addFavorite: (payload) =>
    request('/api/weather/favorites', { method: 'POST', body: JSON.stringify(payload) }),
  removeFavorite: (city) => request(`/api/weather/favorites/${encodeURIComponent(city)}`, { method: 'DELETE' }),

  /* ---------- auth ---------- */
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  signin: (payload) => request('/api/auth/signin', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/api/auth/me')
};
