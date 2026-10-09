import { weatherService } from '../services/weatherService.js';
import { httpError } from '../middleware/errorHandler.js';
import SearchHistory from '../models/SearchHistory.js';
import FavoriteCity from '../models/FavoriteCity.js';

const HISTORY_LIMIT = 10;

/* ---------------- validation helpers ---------------- */

function parseCoords(req) {
  const { lat, lon } = req.query;
  if (lat === undefined && lon === undefined) return null;
  if (lat === undefined || lon === undefined) {
    throw httpError(400, 'Both lat and lon query parameters are required together.');
  }
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw httpError(400, 'lat must be a number between -90 and 90.');
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw httpError(400, 'lon must be a number between -180 and 180.');
  }
  return { lat: latitude, lon: longitude };
}

function parseCity(req) {
  const city = (req.query.city || '').trim();
  if (city.length < 2 || city.length > 60) {
    throw httpError(400, 'Provide a city name between 2 and 60 characters.');
  }
  return city;
}

/** Resolve target location: coordinates (geolocation) or city name. */
function resolveTarget(req) {
  const coords = parseCoords(req);
  if (coords) return { coords };
  return { city: parseCity(req) };
}

/** Best-effort history write — never fails the main request. */
async function recordSearch(current) {
  try {
    await SearchHistory.findOneAndUpdate(
      { city: current.city.toLowerCase() },
      {
        $set: {
          city: current.city.toLowerCase(),
          country: current.country,
          coords: current.coords,
          lastIcon: current.icon,
          lastTemp: current.temperature
        },
        $inc: { count: 1 }
      },
      { upsert: true, new: true }
    );
    // keep only the most recent HISTORY_LIMIT entries
    const overflow = await SearchHistory.find()
      .sort({ updatedAt: -1 })
      .skip(HISTORY_LIMIT)
      .select('_id')
      .lean();
    if (overflow.length) {
      await SearchHistory.deleteMany({ _id: { $in: overflow.map((d) => d._id) } });
    }
  } catch (err) {
    console.warn('[history] Could not record search:', err.message);
  }
}

/* ---------------- handlers ---------------- */

export async function getCurrentWeather(req, res, next) {
  try {
    const target = resolveTarget(req);
    const current = target.coords
      ? await weatherService.fetchCurrentByCoords(target.coords.lat, target.coords.lon)
      : await weatherService.fetchCurrentByCity(target.city);
    await recordSearch(current);
    res.json({ ok: true, data: current });
  } catch (err) {
    next(err);
  }
}

export async function getForecast(req, res, next) {
  try {
    const target = resolveTarget(req);
    const forecast = target.coords
      ? await weatherService.fetchForecastByCoords(target.coords.lat, target.coords.lon)
      : await weatherService.fetchForecastByCity(target.city);
    res.json({ ok: true, data: forecast });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const history = await SearchHistory.find().sort({ updatedAt: -1 }).limit(HISTORY_LIMIT).lean();
    res.json({ ok: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function clearHistory(req, res, next) {
  try {
    await SearchHistory.deleteMany({});
    res.json({ ok: true, data: { cleared: true } });
  } catch (err) {
    next(err);
  }
}

export async function getFavorites(req, res, next) {
  try {
    const favorites = await FavoriteCity.find().sort({ createdAt: -1 }).limit(20).lean();
    res.json({ ok: true, data: favorites });
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req, res, next) {
  try {
    const { city, country = '', coords = null, label = '' } = req.body || {};
    const name = String(city || '').trim().toLowerCase();
    if (name.length < 2 || name.length > 60) {
      throw httpError(400, 'Provide a city name between 2 and 60 characters.');
    }
    const favorite = await FavoriteCity.findOneAndUpdate(
      { city: name },
      { $set: { city: name, country, coords, label } },
      { upsert: true, new: true }
    );
    res.status(201).json({ ok: true, data: favorite });
  } catch (err) {
    next(err);
  }
}

export async function removeFavorite(req, res, next) {
  try {
    const name = String(req.params.city || '').trim().toLowerCase();
    const result = await FavoriteCity.deleteOne({ city: name });
    if (result.deletedCount === 0) throw httpError(404, `Favorite "${name}" not found.`);
    res.json({ ok: true, data: { removed: name } });
  } catch (err) {
    next(err);
  }
}
