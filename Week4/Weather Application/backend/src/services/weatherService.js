import { httpError } from '../middleware/errorHandler.js';

const BASE_URL = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';

// Simple in-memory cache: key → { data, expires } (protects free-tier quota)
const cache = new Map();
const TTL_MS = (Number(process.env.CACHE_TTL_SECONDS) || 600) * 1000;

// One Call 3.0 requires a subscription — disable after the first 401/403
// so we never waste a request (or log noise) once we know it's unavailable.
let oneCallDisabled = false;

function cacheGet(key) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data;
  if (hit) cache.delete(key);
  return null;
}
function cacheSet(key, data) {
  // prevent unbounded growth
  if (cache.size > 300) cache.delete(cache.keys().next().value);
  cache.set(key, { data, expires: Date.now() + TTL_MS });
}

function apiKey() {
  const key = process.env.WEATHER_API_KEY;
  if (!key || key.includes('your_openweathermap')) {
    throw httpError(401, 'Weather API key is not configured. Set WEATHER_API_KEY in backend/.env');
  }
  return key;
}

/** Translate upstream failures into friendly, stable client errors. */
function mapUpstreamError(response, label) {
  if (response.status === 404) throw httpError(404, `City "${label}" not found. Check the spelling.`);
  if (response.status === 401) throw httpError(401, 'Weather service authentication failed (invalid or not-yet-activated API key).');
  if (response.status === 429) throw httpError(429, 'Weather service rate limit exceeded. Try again shortly.');
  if (response.status >= 500) throw httpError(502, 'Weather service temporarily unavailable.');
  throw httpError(response.status || 502, `Weather fetch failed (${response.status}).`);
}

/**
 * Low-level fetch to an OpenWeatherMap URL. Returns parsed JSON,
 * maps upstream errors, and applies the in-memory TTL cache.
 */
async function callApi(fullUrl, label, { quiet = false } = {}) {
  const cached = cacheGet(fullUrl);
  if (cached !== null) return cached;

  let response;
  try {
    response = await fetch(fullUrl, { signal: AbortSignal.timeout(8000) });
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw httpError(504, 'Weather service timed out. Check your connection and retry.');
    }
    throw httpError(503, 'Could not reach the weather service. You appear to be offline.');
  }

  if (!response.ok) {
    if (quiet) return null; // optional call (e.g. One Call) — caller falls back
    mapUpstreamError(response, label);
  }

  const payload = await response.json();
  cacheSet(fullUrl, payload);
  return payload;
}

function buildUrl(base, path, params) {
  const url = new URL(`${base}${path}`);
  url.searchParams.set('units', 'metric');
  url.searchParams.set('appid', apiKey());
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  return url.toString();
}

/* ---------------- normalization ---------------- */

/** Normalize /weather payload → stable view model. */
function normalizeCurrent(data) {
  return {
    city: data.name,
    country: data.sys?.country || '',
    temperature: Math.round(data.main?.temp ?? 0),
    feelsLike: Math.round(data.main?.feels_like ?? 0),
    humidity: data.main?.humidity ?? 0,
    pressure: data.main?.pressure ?? 0,
    windSpeed: data.wind?.speed ?? 0,
    windDeg: data.wind?.deg ?? 0,
    visibility: data.visibility ?? 0,
    condition: data.weather?.[0]?.main || 'Unknown',
    description: data.weather?.[0]?.description || '',
    icon: data.weather?.[0]?.icon || '01d',
    clouds: data.clouds?.all ?? 0,
    sunrise: data.sys?.sunrise ?? 0,
    sunset: data.sys?.sunset ?? 0,
    dt: data.dt ?? 0,
    coords: { lat: data.coord?.lat, lon: data.coord?.lon }
  };
}

/** Bucket the 3-hour /forecast list by calendar day → daily entries. */
function aggregateDaily(forecastList) {
  const buckets = new Map();

  for (const item of forecastList) {
    const date = item.dt_txt.slice(0, 10);
    const temp = item.main?.temp ?? 0;
    const existing = buckets.get(date);

    if (!existing) {
      buckets.set(date, {
        date,
        tempMin: temp,
        tempMax: temp,
        humiditySum: item.main?.humidity ?? 0,
        humidityCount: 1,
        condition: item.weather?.[0]?.main || 'Unknown',
        icon: item.weather?.[0]?.icon || '01d',
        pop: item.pop ?? 0
      });
    } else {
      existing.tempMin = Math.min(existing.tempMin, temp);
      existing.tempMax = Math.max(existing.tempMax, temp);
      existing.humiditySum += item.main?.humidity ?? 0;
      existing.humidityCount += 1;
      existing.pop = Math.max(existing.pop, item.pop ?? 0);
      // pick the icon from the midday (12:00) slot when available
      if (item.dt_txt.includes('12:00')) {
        existing.condition = item.weather?.[0]?.main || existing.condition;
        existing.icon = item.weather?.[0]?.icon || existing.icon;
      }
    }
  }

  return [...buckets.values()]
    .slice(0, 5)
    .map(({ humiditySum, humidityCount, ...day }) => ({
      ...day,
      tempMin: Math.round(day.tempMin),
      tempMax: Math.round(day.tempMax),
      humidity: Math.round(humiditySum / humidityCount),
      pop: Math.round(day.pop * 100)
    }));
}

/** Next 24h of 3-hour slots → hourly strip entries. */
function aggregateHourly(forecastList, fromUnix = Date.now() / 1000) {
  const horizon = fromUnix + 24 * 3600;
  return forecastList
    .filter((item) => item.dt > fromUnix - 1800 && item.dt <= horizon)
    .slice(0, 9)
    .map((item) => ({
      dt: item.dt,
      temp: Math.round(item.main?.temp ?? 0),
      condition: item.weather?.[0]?.main || 'Unknown',
      icon: item.weather?.[0]?.icon || '01d',
      pop: Math.round((item.pop ?? 0) * 100),
      humidity: item.main?.humidity ?? 0
    }));
}

/** Map One Call 3.0 daily[] → the same daily view model (up to 7 days). */
function normalizeOneCallDaily(oneCall) {
  if (!Array.isArray(oneCall?.daily)) return null;
  return oneCall.daily.slice(0, 7).map((d) => ({
    date: new Date(d.dt * 1000).toISOString().slice(0, 10),
    tempMin: Math.round(d.temp?.min ?? 0),
    tempMax: Math.round(d.temp?.max ?? 0),
    humidity: Math.round(d.humidity ?? 0),
    condition: d.weather?.[0]?.main || 'Unknown',
    icon: d.weather?.[0]?.icon || '01d',
    pop: Math.round((d.pop ?? 0) * 100),
    sunrise: d.sunrise ?? 0,
    sunset: d.sunset ?? 0,
    moonPhase: d.moon_phase ?? null
  }));
}

/* ---------------- public service API ---------------- */

/** Fetch the free 5-day / 3-hour forecast list. */
async function fetchForecastList(params) {
  const data = await callApi(buildUrl(BASE_URL, '/forecast', params), params.q || 'forecast');
  return { list: data?.list || [], city: data?.city || {} };
}

/** Combine hourly strip + daily list (One Call 7-day when available). */
async function buildForecast({ list, city }, label) {
  const hourly = aggregateHourly(list);
  let days = aggregateDaily(list);
  let source = 'forecast5'; // free 5-day / 3-hour endpoint

  // Attempt One Call 3.0 for a true 7-day daily forecast
  if (!oneCallDisabled && city?.coord?.lat != null) {
    try {
      const oneCall = await callApi(
        buildUrl(ONECALL_URL, '', { lat: city.coord.lat, lon: city.coord.lon, exclude: 'minutely,alerts' }),
        label,
        { quiet: true }
      );
      const daily7 = oneCall ? normalizeOneCallDaily(oneCall) : null;
      if (daily7 && daily7.length) {
        days = daily7;
        source = 'onecall7';
      }
    } catch {
      oneCallDisabled = true; // key lacks One Call access — stop trying
    }
  }

  return {
    city: city?.name || label,
    country: city?.country || '',
    coords: city?.coord ? { lat: city.coord.lat, lon: city.coord.lon } : null,
    days,
    hourly,
    source
  };
}

export const weatherService = {
  /** Current weather by city name. */
  async fetchCurrentByCity(city) {
    const data = await callApi(buildUrl(BASE_URL, '/weather', { q: city }), city);
    return normalizeCurrent(data);
  },

  /** Current weather by geolocation coordinates. */
  async fetchCurrentByCoords(lat, lon) {
    const data = await callApi(buildUrl(BASE_URL, '/weather', { lat, lon }), `${lat},${lon}`);
    return normalizeCurrent(data);
  },

  /**
   * Forecast: next-24h hourly strip + daily list.
   * Tries One Call 3.0 first (7-day daily, requires free subscription);
   * falls back silently to the standard free /forecast endpoint (5-day).
   */
  async fetchForecastByCity(city) {
    const payload = await fetchForecastList({ q: city });
    return buildForecast(payload, city);
  },

  async fetchForecastByCoords(lat, lon) {
    const payload = await fetchForecastList({ lat, lon });
    return buildForecast(payload, `${lat},${lon}`);
  },

  /**
   * City geocoding (OpenWeatherMap Geocoding API) — powers the
   * search-as-you-type suggestions.
   */
  async geocode(query) {
    const url = `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey()}`;
    const results = (await callApi(url, query)) || [];
    return results.map((r) => ({
      name: r.name,
      state: r.state || '',
      country: r.country || '',
      lat: r.lat,
      lon: r.lon
    }));
  }
};

export { aggregateDaily, aggregateHourly, normalizeCurrent, normalizeOneCallDaily };
