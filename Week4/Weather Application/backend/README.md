# Weather Dashboard — Backend (Express + Mongoose)

MERN backend for **Project 2: Weather Dashboard Application**. Proxies the OpenWeatherMap API (keeping the key server-side), persists search history + per-user favorite cities in MongoDB, and serves JWT accounts for saved locations.

## Stack
- Node.js (ES Modules) + Express 4
- Mongoose ODM → MongoDB (`weather_dashboard`)
- zod (input validation), bcryptjs + jsonwebtoken (auth)
- `express-rate-limit` tiers: auth 20/15min · weather 30/min · general 60/min
- Node.js built-in test runner — **14/14 passing**

## Quick Start
```bash
cp .env.example .env    # add WEATHER_API_KEY, MONGODB_URI, JWT_SECRET
npm install
npm run dev             # http://localhost:5000
npm test                # run integration tests (no DB/key needed)
```

## Endpoints

### Weather (public, rate-limited, zod-validated)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/health` | Server + DB + API-key status |
| GET | `/api/weather/current?city=Pune` | Current weather by city |
| GET | `/api/weather/current?lat=..&lon=..` | Current weather by coordinates |
| GET | `/api/weather/forecast?city=Pune` | Hourly strip + multi-day forecast (5-day free / 7-day with One Call 3.0) |
| GET | `/api/weather/forecast?lat=..&lon=..` | Same, by coordinates |
| GET | `/api/weather/search?q=Tokyo` | Geocoding suggestions (limit 5) |
| GET | `/api/weather/insights?city=Pune&unit=C` | AI explanation of notable changes, activities, precautions, and 3 takeaways — 10/min |
| GET | `/api/weather/history` | Last 10 searched cities |
| DELETE | `/api/weather/history` | Clear history |

### Favorites — require `Authorization: Bearer <token>` (per-user row scoping)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/weather/favorites` | List *my* saved locations |
| POST | `/api/weather/favorites` | Save `{ city, country, coords, label }` (409 on duplicate) |
| DELETE | `/api/weather/favorites/:city` | Remove one of *my* favorites (404 if absent) |

### Alert center — require `Authorization: Bearer <token>`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/weather/alerts/preview` | Check every saved location against the user's current thresholds and record matches |
| GET | `/api/weather/alerts/history` | Last 50 detected threshold or official warning events for *my* saved locations |

### Alert settings — require `Authorization: Bearer <token>` (per-user row scoping)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/settings` | *My* alert preferences (defaults before first save) |
| PUT | `/api/settings` | Upsert `{ alertEnabled, minTempAlert °C, maxWindAlert m/s }` (zod validated) |

For model-backed briefings, configure `AI_GATEWAY_API_KEY` and optionally
`AI_GATEWAY_BASE_URL` / `AI_GATEWAY_MODEL` (defaults to Vercel AI Gateway and
`openai/gpt-4o-mini`). `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL`
remain supported as a compatible fallback. If no model is configured or the
model is unavailable, the endpoint uses deterministic local analysis.

### Auth

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/signup` | `{ name, email, password≥8 }` → `{ token, user }` |
| POST | `/api/auth/signin` | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Current profile from Bearer token |

## Layered Architecture
```
routes/auth.js    → controllers/authController.js    → models/User.js
routes/weather.js → controllers/weatherController.js → services/weatherService.js → OpenWeatherMap
                                                   → models/ (SearchHistory, FavoriteCity) → MongoDB
middleware: rateLimiter → validate (zod) → requireAuth (favorites/auth) → errorHandler
```
