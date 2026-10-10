import { weatherService } from '../services/weatherService.js';
import { httpError } from '../middleware/errorHandler.js';
import SearchHistory from '../models/SearchHistory.js';
import FavoriteCity from '../models/FavoriteCity.js';

const HISTORY_LIMIT = 10;

/* ---------------- helpers ---------------- */

/** Resolve validated target: coordinates (geolocation) or city name. */
function resolveTarget(req) {
  const { city, lat, lon } = req.query;
  if (lat !== undefined && lon !== undefined) return { coords: { lat: Number(lat), lon: Number(lon) } };
  return { city };
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

/* ---------------- weather handlers ---------------- */

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

/** City geocoding suggestions (search-as-you-type). */
export async function searchCities(req, res, next) {
  try {
    const results = await weatherService.geocode(req.query.q);
    res.json({ ok: true, data: results });
  } catch (err) {
    next(err);
  }
}

/* ---------------- history (public, per-browser) ---------------- */

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

/* ---------------- favorites (authenticated, per-user) ----------------
 * Row-level security equivalent: every query is filtered by req.user.id,
 * so a user can never read or mutate another user's saved locations.
 * ------------------------------------------------------------------- */

export async function getFavorites(req, res, next) {
  try {
    const favorites = await FavoriteCity.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();
    res.json({ ok: true, data: favorites });
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req, res, next) {
  try {
    const { city, country = '', coords = null, label = '' } = req.body;
    const name = city.toLowerCase();

    const favorite = await FavoriteCity.findOneAndUpdate(
      { user: req.user.id, city: name },
      { $set: { user: req.user.id, city: name, country, coords, label } },
      { upsert: true, new: true }
    );

    res.status(201).json({ ok: true, data: favorite });
  } catch (err) {
    if (err.code === 11000) return next(httpError(409, 'City already saved to favorites.'));
    next(err);
  }
}

export async function removeFavorite(req, res, next) {
  try {
    const name = String(req.params.city || '').trim().toLowerCase();
    const result = await FavoriteCity.deleteOne({ user: req.user.id, city: name });
    if (result.deletedCount === 0) throw httpError(404, `Favorite "${name}" not found.`);
    res.json({ ok: true, data: { removed: name } });
  } catch (err) {
    next(err);
  }
}
