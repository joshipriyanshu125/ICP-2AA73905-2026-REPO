import { Router } from 'express';
import { weatherLimiter, insightsLimiter } from '../middleware/rateLimiter.js';
import { validateQuery } from '../middleware/validate.js';
import { weatherQuerySchema, searchQuerySchema, insightsQuerySchema } from '../middleware/schemas.js';
import { requireAuth } from '../middleware/auth.js';
import {
  getCurrentWeather,
  getForecast,
  getWeatherInsights,
  searchCities,
  getHistory,
  clearHistory,
  getFavorites,
  addFavorite,
  removeFavorite,
  getAlertPreview,
  getAlertHistory
} from '../controllers/weatherController.js';

const router = Router();

/* Weather reads hit the external API — stricter limiter + zod validation */
router.get('/current', weatherLimiter, validateQuery(weatherQuerySchema), getCurrentWeather);
router.get('/forecast', weatherLimiter, validateQuery(weatherQuerySchema), getForecast);
router.get('/search', weatherLimiter, validateQuery(searchQuerySchema), searchCities);

/* AI insights reuse the cached weather data but may call an LLM — tighter limit */
router.get('/insights', insightsLimiter, validateQuery(insightsQuerySchema), getWeatherInsights);

/* Local persistence — history is public (per-browser), favorites need auth */
router.get('/history', getHistory);
router.delete('/history', clearHistory);

router.get('/favorites', requireAuth, getFavorites);
router.post('/favorites', requireAuth, addFavorite);
router.delete('/favorites/:city', requireAuth, removeFavorite);

/* Saved-location alert center — both views are scoped to the signed-in user. */
router.get('/alerts/preview', weatherLimiter, requireAuth, getAlertPreview);
router.get('/alerts/history', requireAuth, getAlertHistory);

export default router;
