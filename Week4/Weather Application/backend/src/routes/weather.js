import { Router } from 'express';
import { weatherLimiter } from '../middleware/rateLimiter.js';
import {
  getCurrentWeather,
  getForecast,
  getHistory,
  clearHistory,
  getFavorites,
  addFavorite,
  removeFavorite
} from '../controllers/weatherController.js';

const router = Router();

// Weather reads hit the external API — apply the stricter limiter
router.get('/current', weatherLimiter, getCurrentWeather);
router.get('/forecast', weatherLimiter, getForecast);

// Local persistence (MongoDB only)
router.get('/history', getHistory);
router.delete('/history', clearHistory);

router.get('/favorites', getFavorites);
router.post('/favorites', addFavorite);
router.delete('/favorites/:city', removeFavorite);

export default router;
