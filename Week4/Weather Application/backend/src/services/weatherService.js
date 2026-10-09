import { httpError } from '../middleware/errorHandler.js';

const BASE_URL = process.env.OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

// Simple in-memory cache: key → { data, expires } (protects free-tier quota)
const cache = new Map();
const TTL_MS = (Number(process.env.CACHE_TTL_SECONDS) || 600) * 1000;

function cacheGet(key) {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data;
  if (hit) cache.delete(key);
  return null;
}
function cacheSet(key, data) {
  // prevent unbounded growth
  if (cache.size > 200) cache.delete(cache.keys().next().value);
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
function mapUpstreamError(response, cityLabel) {
  if (response.status === 404) throw httpError(404, `City "${cityLabel}" not found. Check the spelling.`);
  if (response.status === 401) throw httpError(401, 'Weather service authentication failed (invalid API key).');
  if (response.status === 429) throw httpError(429, 'Weather service rate limit exceeded. Try again shortly.');
  if (response.status >= 500) throw httpError(502, 'Weather service temporarily unavailable.');
  throw httpError(response.status || 502, `Weather fetch failed (${response.status}).`);
}

async function callOpenWeather(path, params, cityLabel) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('units', 'metric');
  url.searchParams.set('appid', apiKey());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const cacheKey = url.toString();
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw httpError(504, 'Weather service timed out. Check your connection and retry.');
    }
    throw httpError(503, 'Could not reach the weather service. You appear to be offline.');
  }

  if (!response.ok) mapUpstreamError(response, cityLabel);

  const payload = await response.json();
  cacheSet(cacheKey, payload);
  return payload;
}

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
    visibility: data.visibility ?? 0,
    condition: data.weather?.[0]?.main || 'Unknown',
    description: data.weather?.[0]?.description || '',
    icon: data.weather?.[0]?.icon || '01d',
    sunrise: data.sys?.sunrise ?? 0,
    sunset: data.sys?.sunset ?? 0,
    dt: data.dt ?? 0,
    coords: { lat: data.coord?.lat, lon: data.coord?.lon }
  };
}

/** Bucket the 3-hour /forecast list by calendar day → 5 daily entries. */
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

export const weatherService = {
  /** Current weather by city name. */
  async fetchCurrentByCity(city) {
    const data = await callOpenWeather('/weather', { q: city }, city);
    return normalizeCurrent(data);
  },

  /** Current weather by geolocation coordinates. */
  async fetchCurrentByCoords(lat, lon) {
    const data = await callOpenWeather('/weather', { lat, lon }, `${lat},${lon}`);
    return normalizeCurrent(data);
  },

  /** 5-day / 3-hour forecast by city name → aggregated daily. */
  async fetchForecastByCity(city) {
    const data = await callOpenWeather('/forecast', { q: city }, city);
    return {
      city: data.city?.name || city,
      country: data.city?.country || '',
      days: aggregateDaily(data.list || [])
    };
  },

  /** 5-day forecast by coordinates. */
  async fetchForecastByCoords(lat, lon) {
    const data = await callOpenWeather('/forecast', { lat, lon }, `${lat},${lon}`);
    return {
      city: data.city?.name || '',
      country: data.city?.country || '',
      days: aggregateDaily(data.list || [])
    };
  }
};

export { aggregateDaily, normalizeCurrent };
