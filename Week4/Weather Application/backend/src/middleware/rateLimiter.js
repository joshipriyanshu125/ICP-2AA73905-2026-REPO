import rateLimit from 'express-rate-limit';

/** General limiter: 60 requests / minute / IP on all /api routes. */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests. Please slow down and retry shortly.' }
});

/** Stricter limiter for weather endpoints (external API quota protection). */
export const weatherLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Weather request limit reached. Try again in a minute.' }
});

/** Stricter still for auth routes (brute-force protection). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many sign-in attempts. Try again in 15 minutes.' }
});

/** Insights may call a paid LLM — tight limit to control cost/latency. */
export const insightsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Insight request limit reached. Try again in a minute.' }
});
