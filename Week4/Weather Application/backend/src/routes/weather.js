import { Router } from 'express';
import { weatherLimiter } from '../middleware/rateLimiter.js';
import { validateQuery } from '../middleware/validate.js';
import { weatherQuerySchema, searchQuerySchema } from '../middleware/schemas.js';
import { requireAuth } from '../middleware/auth.js';
import {
  getCurrentWeather,
  getForecast,
  searchCities,
  getHistory,
  clearHistory,
  getFavorites,
  addFavorite,
  removeFavorite
} from '../controllers/weatherController.js';

const router = Router();

/* Weather reads hit the external API — stricter limiter + zod validation */
router.get('/current', weatherLimiter, validateQuery(weatherQuerySchema), getCurrentWeather);
router.get('/forecast', weatherLimiter, validateQuery(weatherQuerySchema), getForecast);
router.get('/search', weatherLimiter, validateQuery(searchQuerySchema), searchCities);

/* Local persistence — history is public (per-browser), favorites need auth */
router.get('/history', getHistory);
router.delete('/history', clearHistory);

router.get('/favorites', requireAuth, getFavorites);
router.post('/favorites', requireAuth, addFavorite);
router.delete('/favorites/:city', requireAuth, removeFavorite);

export default router;
