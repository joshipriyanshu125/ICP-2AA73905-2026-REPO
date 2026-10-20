# Week 5: Weather Dashboard — Technical Documentation (Project 2 Completion)

**Internship Portal ID:** `ICP-2AA73905-2026`
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
**Project:** Weather Dashboard Application (Project 2)
**Internship Week:** Week 5 — Completion & Live Deployment
**Stack:** MERN (MongoDB, Express, React, Node.js) + OpenWeatherMap API
**Live frontend:** [https://weather-application-frontend-seven.vercel.app/](https://weather-application-frontend-seven.vercel.app/)
**Live backend:** [https://weather-application-s73i.onrender.com/](https://weather-application-s73i.onrender.com/)

> Project 2 was implemented in Week 4. This document records the **as-built state** of that codebase as verified for Week 5 completion and its **live production deployment**. Baseline documentation lives in [`Week4/documentation.md`](../Week4/documentation.md). Anything listed as “deferred” below is **not** present in the current source code.

---

## Table of Contents

1. [Week 5 Objectives & Completion Criteria](#1-week-5-objectives--completion-criteria)
2. [System Architecture](#2-system-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Feature Implementation Details](#5-feature-implementation-details)
6. [Database Design (MongoDB)](#6-database-design-mongodb)
7. [REST API Endpoints](#7-rest-api-endpoints)
8. [Error Handling, Security & Limits](#8-error-handling-security--limits)
9. [Automated Testing (22 Tests)](#9-automated-testing-22-tests)
10. [Performance & Caching](#10-performance--caching)
11. [Local Setup & Verification](#11-local-setup--verification)
12. [Known Limitations & Week 6 Roadmap](#12-known-limitations--week-6-roadmap)
13. [Key Engineering Learnings](#13-key-engineering-learnings)
14. [Deliverables & Verification Summary](#14-deliverables--verification-summary)

---

## 1. Week 5 Objectives & Completion Criteria

**Syllabus task:** *Complete Project 2 with full functionality.*

Project 2 was built during Week 4. Week 5 completion was defined as verifying the following against the actual source code:

| # | Criterion | Evidence | Status |
| :---: | :--- | :--- | :---: |
| 1 | Every advertised feature exists in the codebase | Backend routes, services, models, and frontend components reviewed | ✅ |
| 2 | Weather data flows end-to-end | `/api/weather/current`, `/forecast`, `/search`, `/insights` | ✅ |
| 3 | Authentication and per-user data work | JWT routes, bcrypt hashing, user-scoped favorites/settings/alerts | ✅ |
| 4 | Automated suite passes | `npm test` → 22 tests, 22 pass | ✅ |
| 5 | Production build succeeds | `npm run build` → `dist/` generated | ✅ |
| 6 | Documentation, completion report, and deployment guide delivered | Week 5 documents | ✅ |
| 7 | Live deployment | Frontend on Vercel + backend on Render; health and CORS verified | ✅ |

### Live deployment

| Service | Platform | URL | Verification |
| :--- | :--- | :--- | :--- |
| Frontend | Vercel | [weather-application-frontend-seven.vercel.app](https://weather-application-frontend-seven.vercel.app/) | App shell and `/auth` route return `200` |
| Backend API | Render | [weather-application-s73i.onrender.com](https://weather-application-s73i.onrender.com/) | `/health` → `200 OK`; MongoDB connected; weather key configured |
| Weather endpoint | Render | [/api/weather/current?city=Pune](https://weather-application-s73i.onrender.com/api/weather/current?city=Pune) | Valid JSON; production CORS origin allowed |

> Verified on 20 October 2026. Render free-tier services may cold-start in 20–60 s after inactivity.

### Explicitly not delivered

These items appear in older planning notes but are **not implemented** in the current codebase:

- Air Quality Index endpoint or tile
- Offline detection banner and reconnect refresh
- Automatic retry with exponential backoff
- Stale-response guards / request cancellation on dashboard fetches
- PWA manifest and offline weather caching
- Animated weather backgrounds
- Formal accessibility audit (basic ARIA labels and keyboard navigation exist)

They are tracked in [Section 12](#12-known-limitations--week-6-roadmap) instead of being reported as complete.

---

## 2. System Architecture

```text
┌────────────────────────────────────────────────────────────────┐
│          React 18 SPA (Vite 5 — Port 5173)                     │
│  Routes:  / (Dashboard) · /auth (Sign in/up) · /alerts         │
│                                                                │
│  SearchForm → CurrentWeatherCard → StatTiles → HourlyStrip     │
│  WeatherInsights → ForecastCharts (lazy) → ForecastList        │
│  FavoritesBar · AlertBanner · AlertSettings · ThemeToggle      │
│                                                                │
│  ThemeContext (dark/light)   AuthContext (JWT session)         │
└──────────────────────────┬─────────────────────────────────────┘
                           │ HTTP / JSON (fetch + Bearer token)
                           │ GET /api/weather/current?city=Pune
┌──────────────────────────▼─────────────────────────────────────┐
│              Express API (Node.js — Port 5000)                 │
│                                                                │
│  routes/auth.js ────► authController ────► User (bcrypt + JWT) │
│  routes/weather.js ─► weatherController ─► weatherService      │
│  routes/settings.js ► settingsController ► UserSettings        │
│                                                                │
│  middleware: rateLimiter → zod validate → requireAuth           │
│  services: weatherService · insightsService · alertService      │
│                                                                │
│  models: User · SearchHistory · FavoriteCity · UserSettings     │
│          · AlertHistory ───────────────────────► MongoDB        │
└──────────────────────────┬─────────────────────────────────────┘
                           │ HTTPS (server-side only)
┌──────────────────────────▼─────────────────────────────────────┐
│                  OpenWeatherMap REST API                       │
│  /data/2.5/weather · /data/2.5/forecast · /geo/1.0/direct      │
│  /data/3.0/onecall (optional, 7-day + official alerts)         │
└────────────────────────────────────────────────────────────────┘
                           │ optional
┌──────────────────────────▼─────────────────────────────────────┐
│   OpenAI-compatible LLM (Vercel AI Gateway or OpenAI direct)    │
│   Used only for the weather briefing; rule engine is fallback  │
└────────────────────────────────────────────────────────────────┘
```

### Design decisions

1. **API key isolation:** `WEATHER_API_KEY` exists only in the backend environment. The browser calls our `/api/*` routes; `vite.config.js` proxies them in development.
2. **Single external gateway:** all OpenWeatherMap traffic goes through `weatherService.js`, which centralizes caching, timeouts, error mapping, and payload normalization.
3. **Row-level scoping:** favorites, alert settings, and alert history always query with `{ user: req.user.id }`; unique compound indexes prevent duplicates.
4. **Progressive enhancement:** One Call 3.0 is attempted first; on 401/403 it is disabled for the process and the free 5-day forecast is used.
5. **Graceful AI degradation:** the insights endpoint never fails because of the LLM layer — a deterministic rule engine always produces a valid briefing.

---

## 3. Backend Architecture

### Directory structure

```
Week4/Weather Application/backend/
├── package.json             # ES Modules; express, mongoose, zod, bcryptjs, jsonwebtoken
├── README.md                # Backend API reference
├── src/
│   ├── server.js            # CORS, JSON, /health, route mounting, error handlers
│   ├── config/db.js         # Mongoose connection (non-fatal in development)
│   ├── controllers/
│   │   ├── authController.js       # signup / signin / me
│   │   ├── settingsController.js   # per-user alert preferences
│   │   └── weatherController.js    # weather, search, insights, history, favorites, alerts
│   ├── middleware/
│   │   ├── auth.js          # signToken / verifyToken / requireAuth
│   │   ├── validate.js      # zod body/query validation → HTTP 400
│   │   ├── schemas.js       # weather, insights, search, auth, favorite, settings schemas
│   │   ├── errorHandler.js  # centralized errors + 404 + httpError() helper
│   │   └── rateLimiter.js   # weather / insights / auth limiters
│   ├── models/
│   │   ├── User.js          # name, email (unique), passwordHash
│   │   ├── SearchHistory.js # city, country, coords, count, last icon/temp
│   │   ├── FavoriteCity.js  # user ref + city + coords; unique {user, city}
│   │   ├── UserSettings.js  # user ref + alertEnabled, minTempAlert, maxWindAlert
│   │   └── AlertHistory.js  # user ref + fingerprint + detected alert
│   ├── routes/
│   │   ├── auth.js          # POST /signup, POST /signin, GET /me
│   │   ├── weather.js       # weather reads + favorites + alert center
│   │   └── settings.js      # GET / PUT alert preferences
│   └── services/
│       ├── weatherService.js   # OWM gateway, normalization, cache, One Call fallback
│       ├── insightsService.js  # LLM briefing + deterministic rule engine
│       └── alertService.js     # threshold evaluation + fingerprinting
└── tests/api.test.js        # 22 tests with node:test
```

### Module responsibilities

| Module | File | Responsibility |
| :--- | :--- | :--- |
| **Server** | `src/server.js` | Express bootstrap, CORS, route mounting, health check |
| **Auth** | `authController` + `middleware/auth.js` | Register/login, bcrypt (10 rounds), JWT (`7d` default), `requireAuth` guard |
| **Weather service** | `services/weatherService.js` | OWM calls, URL building, TTL cache, 8 s timeout, normalization, geocoding, One Call fallback |
| **Weather controller** | `controllers/weatherController.js` | Target resolution, history writes, favorites, insights orchestration, alert preview/history |
| **Insights service** | `services/insightsService.js` | 3 actionable takeaways + structured analysis; LLM path with rule-engine fallback and cooldown |
| **Alert service** | `services/alertService.js` | Temperature/wind threshold checks, official warning mapping, dedup fingerprints |
| **Settings** | `settingsController.js` + `routes/settings.js` | Per-user alert preferences with zod validation and defaults |
| **Validation** | `middleware/validate.js` + `schemas.js` | zod schemas → friendly HTTP 400 messages before controllers run |
| **Errors** | `middleware/errorHandler.js` | Maps `err.status` to `{ ok: false, error }`; hides 5xx details in production |
| **Rate limits** | `middleware/rateLimiter.js` | Weather 30/min · insights 10/min · auth 20/15 min |

---

## 4. Frontend Architecture

### Directory structure

```
Week4/Weather Application/frontend/
├── package.json             # react 18, react-router-dom 6, recharts 2, vite 5
├── vite.config.js           # dev proxy: /api and /health → http://localhost:5000
├── index.html               # SPA entry + static metadata
└── src/
    ├── main.jsx             # Providers: ThemeProvider → AuthProvider → BrowserRouter
    ├── App.jsx              # Routes: / Dashboard, /auth AuthPage, /alerts AlertsPage
    ├── api.js               # Data access layer + automatic JWT header
    ├── index.css            # Design tokens, themes, layout, components
    ├── context/
    │   ├── ThemeContext.jsx # dark/light → documentElement.dataset.theme
    │   └── AuthContext.jsx  # session restore, signup/signin/logout
    ├── hooks/useGeolocation.js  # geolocation state machine + formatting helpers
    ├── pages/
    │   ├── Dashboard.jsx    # fetch orchestration, favorites, metadata, accents
    │   ├── AuthPage.jsx     # sign-in / sign-up form
    │   └── AlertsPage.jsx   # threshold preview + alert history
    └── components/
        ├── SearchForm.jsx         # Debounced geocoding suggestions + history chips
        ├── CurrentWeatherCard.jsx # Hero temperature, feels-like, high/low, favorite toggle
        ├── StatTiles.jsx          # Humidity, wind, pressure, visibility, sunrise, sunset
        ├── HourlyStrip.jsx        # Next-24-hour horizontal strip
        ├── ForecastCharts.jsx     # recharts temperature + precipitation (lazy chunk)
        ├── ForecastList.jsx       # Multi-day forecast rows
        ├── WeatherInsights.jsx    # AI/rule-engine briefing card
        ├── AlertBanner.jsx        # Official warnings + custom threshold alerts
        ├── AlertSettings.jsx      # Per-user threshold modal
        ├── FavoritesBar.jsx       # Saved locations quick-switcher
        ├── GeolocationBadge.jsx   # “Use my location” + permission/accuracy status
        └── ThemeToggle.jsx        # Sun/moon theme switch
```

### Three-tier separation

```text
┌──────────────────────────────────────────────────────────────┐
│ 1. Presentation — components/*.jsx (markup + CSS)            │
└───────────────────────┬──────────────────────────────────────┘
                        │ user actions (props callbacks)
┌───────────────────────▼──────────────────────────────────────┐
│ 2. State & business logic — pages/Dashboard.jsx + contexts   │
│    (fetch orchestration, unit conversion, favorites, meta)   │
└───────────────────────┬──────────────────────────────────────┘
                        │ network requests
┌───────────────────────▼──────────────────────────────────────┐
│ 3. Data access — api.js → our Express API (never OWM direct) │
└──────────────────────────────────────────────────────────────┘
```

### View model contract (backend → frontend)

```javascript
/** GET /api/weather/current */
{
  city, country, temperature, feelsLike, humidity, pressure,
  windSpeed, windDeg, visibility, condition, description, icon,
  clouds, sunrise, sunset, dt, coords: { lat, lon }
}

/** GET /api/weather/forecast */
{
  city, country, coords,
  source: 'forecast5' | 'onecall7',
  hourly: [{ dt, temp, condition, icon, pop, humidity }],
  days:   [{ date, tempMin, tempMax, humidity, condition, icon, pop,
             sunrise?, sunset?, moonPhase? }],
  alerts: [{ senderName, event, start, end, description, tags }]
}

/** GET /api/weather/search */
[{ name, state, country, lat, lon }]

/** GET /api/weather/insights */
{
  insights: [string, string, string],
  summary, changes[], activities[], precautions[],
  source: 'llm' | 'local', city, unit, generatedAt
}
```

---

## 5. Feature Implementation Details

### 5.1 OpenWeatherMap integration & normalization

`weatherService.js` is the only module that talks to OpenWeatherMap.

| OWM endpoint | Purpose | Cache key |
| :--- | :--- | :--- |
| `/data/2.5/weather` | Current conditions | Full request URL |
| `/data/2.5/forecast` | 5-day / 3-hour forecast | Full request URL |
| `/geo/1.0/direct` | City geocoding suggestions | Full request URL |
| `/data/3.0/onecall` | Optional 7-day forecast + official alerts | Full request URL |

**Forecast aggregation**

- `aggregateHourly(list)` keeps entries within the next 24 hours (plus a 30-minute grace window), caps at 9 slots, and converts `pop` from a fraction to a percentage.
- `aggregateDaily(list)` buckets entries by `dt_txt` date, computes min/max temperature, averages humidity, uses the maximum `pop`, and prefers the midday icon. It caps output at 5 days because that is what the free plan provides.
- `normalizeOneCallDaily()` maps One Call 3.0 daily data into the same day model and can extend the list to 7 days.

**Progressive enhancement**

- If One Call 3.0 succeeds, the response includes `source: 'onecall7'` and normalized official alerts.
- If the key lacks access (401/403), `oneCallDisabled` is set and all subsequent requests skip One Call. The free 5-day forecast remains fully functional.
- Every upstream request has an 8-second timeout via `AbortSignal.timeout(8000)`.

### 5.2 Search, geocoding, and history

- `SearchForm.jsx` debounces input by 300 ms, shows up to 5 geocoding suggestions, and supports `ArrowUp` / `ArrowDown` / `Enter` / `Escape`.
- Free-text submit still works when geocoding returns no exact match.
- Successful current-weather requests upsert a `SearchHistory` row and trim the collection to the 10 most recent cities.
- Search history is **shared across clients** (there is no browser or user identifier on history reads); favorites and settings are user-scoped.

### 5.3 AI weather briefing

`insightsService.js` returns both a structured analysis and three quick takeaways:

- **LLM path:** enabled when `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY` is set. The service sends a compact weather summary to an OpenAI-compatible `/chat/completions` endpoint and requests JSON.
- **Fallback path:** `buildLocalInsights()` always returns exactly three actionable sentences covering precipitation, comfort/clothing, and the day’s outlook. `buildLocalAnalysis()` adds summary, changes, activities, and precautions.
- **Circuit breaker:** after 3 consecutive LLM failures, the service skips the LLM for 10 minutes and serves local analysis.
- **Caching:** insights are cached for 10 minutes (maximum 100 entries).
- The endpoint never fails because of the AI layer; weather-data errors still propagate normally.

### 5.4 Severe-weather alerts

`alertService.js` evaluates:

1. Current temperature below `minTempAlert`.
2. Any forecast day with `tempMin` below `minTempAlert`.
3. Current wind above `maxWindAlert`.
4. Official One Call 3.0 warnings (when available).

Alert records include a stable `id`, `type`, `source` (`threshold` or `official`), title, message, value, threshold, `forecastFor`, and `detectedAt`.

`GET /api/weather/alerts/preview` checks every saved location, records matches in `AlertHistory`, and returns a per-location status (`triggered`, `clear`, or `unavailable`). History is deduplicated by the fingerprint `city|type|forecastFor` and scoped to the signed-in user.

### 5.5 Authentication, favorites, and settings

- **Sign-up:** validates name, email, and password (minimum 8 characters), hashes with bcrypt (10 rounds), and returns a JWT.
- **Sign-in:** compares the bcrypt hash and returns a JWT (`7d` default).
- **Session restore:** `AuthContext` stores the token in `localStorage` and calls `GET /api/auth/me` on load; if restore fails, the stored token and user are cleared.
- **Favorites:** unique compound index `{ user, city }`; every query filters by `req.user.id`.
- **Settings:** one document per user with `alertEnabled`, `minTempAlert` (−60…60 °C), and `maxWindAlert` (0…120 m/s). Defaults are `true`, `5`, and `20`.

### 5.6 Geolocation

`useGeolocation.js` implements the state machine `idle → locating → granted | denied | unavailable`.

- Requests a fresh high-accuracy position (`maximumAge: 0`, 10 s timeout).
- If a non-permission error occurs, retries once with a relaxed network-based fix (12 s timeout).
- Exposes horizontal accuracy so `GeolocationBadge.jsx` can warn about coarse (>10 km) positions.
- If permission is denied, the dashboard falls back to manual city search.

### 5.7 Theme, units, and metadata

- `ThemeContext` stores `dark` or `light`, writes `document.documentElement.dataset.theme`, and persists the choice in `localStorage`.
- `Dashboard.jsx` maps the current condition to `data-condition` (`clear`, `clouds`, `rain`, `thunderstorm`, `snow`, `atmos`), and CSS redefines the accent color per condition per theme.
- The °C ↔ °F toggle is applied client-side and persisted in `localStorage`.
- `Dashboard.jsx` and `AuthPage.jsx` update `document.title`, description, and Open Graph metadata.

### 5.8 UI states and accessibility basics

- Initial geolocation wait shows skeleton cards; loading an existing city shows a slim loading bar.
- Errors render in a dismissible `role="alert"` banner.
- Empty states prompt the user to search or enable location.
- Search suggestions are keyboard navigable; icon-only header controls have `aria-label`s; the insights card exposes `aria-busy` while loading.
- There is **no formal accessibility audit**, no skip link, and no automated accessibility test in this delivery.

---

## 6. Database Design (MongoDB)

**Database:** `weather_dashboard` (created lazily on first write)

| Collection | Purpose | Key fields | Index |
| :--- | :--- | :--- | :--- |
| `users` | Accounts for saved locations | `name`, `email` (unique, lowercase), `passwordHash`, timestamps | unique `{ email: 1 }` |
| `searchhistories` | Last 10 searched cities | `city` (unique, lowercase), `country`, `coords`, `count`, `lastIcon`, `lastTemp` | unique `{ city: 1 }` |
| `favoritecities` | Saved locations per user | `user`, `city`, `country`, `label`, `coords` | unique `{ user: 1, city: 1 }` |
| `usersettings` | Alert preferences per user | `user` (unique), `alertEnabled`, `minTempAlert`, `maxWindAlert` | unique `{ user: 1 }` |
| `alerthistories` | Detected alert events per user | `user`, `city`, `country`, `type`, `source`, `title`, `message`, `value`, `threshold`, `forecastFor`, `detectedAt`, `fingerprint` | unique `{ user: 1, fingerprint: 1 }` |

### Entity relationship

```text
users ──1:N──► favoritecities      (row-scoped by user id)
  │
  ├──1:1──► usersettings           (alert thresholds)
  │
  └──1:N──► alerthistories         (deduplicated detected alerts)

searchhistories: public/shared, trimmed to the 10 most recent cities
favoritecities:  unique { user, city } prevents duplicate saves per account
alerthistories:  unique { user, fingerprint } prevents duplicate events per day/type
```

---

## 7. REST API Endpoints

**Production base URL:** `https://weather-application-s73i.onrender.com`
**Local development:** `http://localhost:5000`

### Health

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Returns `{ ok, status, timestamp, services: { database, weatherApi } }` |

### Weather (public, rate-limited, zod-validated)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/weather/current?city=Pune` | Current weather by city |
| `GET` | `/api/weather/current?lat=18.52&lon=73.85` | Current weather by coordinates |
| `GET` | `/api/weather/forecast?city=Pune` | Hourly strip + multi-day forecast |
| `GET` | `/api/weather/forecast?lat=…&lon=…` | Forecast by coordinates |
| `GET` | `/api/weather/search?q=Reykjavik` | Geocoding suggestions (limit 5) |
| `GET` | `/api/weather/insights?city=Pune&unit=C` | AI/rule-engine briefing (10/min) |
| `GET` | `/api/weather/history` | Last 10 searched cities |
| `DELETE` | `/api/weather/history` | Clear search history |

### Favorites — require `Authorization: Bearer <token>`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/weather/favorites` | List my saved locations |
| `POST` | `/api/weather/favorites` | Save `{ city, country?, coords?, label? }` |
| `DELETE` | `/api/weather/favorites/:city` | Remove one of my favorites (404 if absent) |

### Alert center — require `Authorization: Bearer <token>`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/weather/alerts/preview` | Check every saved location against my thresholds and record matches |
| `GET` | `/api/weather/alerts/history` | Last 50 detected alert events |

### Alert settings — require `Authorization: Bearer <token>`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/settings` | My preferences (defaults before first save) |
| `PUT` | `/api/settings` | Upsert `{ alertEnabled, minTempAlert, maxWindAlert }` |

### Auth

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | `{ name, email, password≥8 }` → `{ token, user }` |
| `POST` | `/api/auth/signin` | `{ email, password }` → `{ token, user }` (401 on bad credentials) |
| `GET` | `/api/auth/me` | Current profile from the Bearer token |

### Sample response — `GET /api/weather/forecast?city=Pune`

```json
{
  "ok": true,
  "data": {
    "city": "Pune",
    "country": "IN",
    "source": "forecast5",
    "hourly": [
      { "dt": 1791569200, "temp": 33, "condition": "Clear", "icon": "01d", "pop": 0, "humidity": 42 }
    ],
    "days": [
      { "date": "2026-10-09", "tempMin": 21, "tempMax": 34, "humidity": 48, "condition": "Clear", "icon": "01d", "pop": 0 }
    ],
    "alerts": []
  }
}
```

---

## 8. Error Handling, Security & Limits

### Upstream error mapping (`weatherService.js`)

| Upstream condition | Client response |
| :--- | :--- |
| `404` city not found | `404 — City "xyz" not found. Check the spelling.` |
| `401` invalid / inactive key | `401 — Weather service authentication failed (invalid or not-yet-activated API key).` |
| `429` rate limited | `429 — Weather service rate limit exceeded. Try again shortly.` |
| `5xx` upstream outage | `502 — Weather service temporarily unavailable.` |
| Timeout (8 s) | `504 — Weather service timed out. Check your connection and retry.` |
| DNS / offline | `503 — Could not reach the weather service. You appear to be offline.` |
| zod validation failure | `400` with field-level messages joined into one readable string |

### Security measures

1. **API key isolation:** `WEATHER_API_KEY` is server-side only; the frontend never sees it.
2. **JWT auth:** HS256 tokens with configurable expiry (`JWT_EXPIRES_IN`, default `7d`).
3. **Password hashing:** bcryptjs with 10 salt rounds; `passwordHash` is stripped by `toSafeJSON()`.
4. **Validation:** zod schemas validate every weather query, search query, auth body, favorite payload, and settings update before controllers run.
5. **Row-level scoping:** every favorites/settings/alert query filters on `req.user.id`.
6. **Rate limiting:** weather 30/min, insights 10/min, auth 20 per 15 min (per IP).
7. **CORS:** restricted to `CLIENT_ORIGIN` (default `http://localhost:5173`).
8. **Error hygiene:** 5xx details and stack traces are hidden in production.
9. **Payload limit:** JSON bodies are capped at 100 kB.

> **Current limitation:** the frontend does not automatically retry transient failures and does not cancel in-flight dashboard requests. The search debounce clears its timer and calls `abort()` on a controller that is not yet wired into the fetch; out-of-order responses are therefore still possible under slow networks. This is tracked for future hardening.

---

## 9. Automated Testing (22 Tests)

Run from `Week4/Weather Application/backend`:

```bash
npm test
# → tests 22 · pass 22 · fail 0
```

The suite uses only Node’s built-in `node:test` and `node:assert/strict` — no live database, no live OpenWeatherMap key, and no extra dependencies.

| Area | Tests | Coverage |
| :--- | ---: | :--- |
| Forecast aggregation & hourly strip | 4 | Daily bucketing, 5-day cap, next-24-hour window, empty list |
| Payload normalization | 4 | Current weather, missing optional fields, One Call daily, One Call alerts |
| Validation & error mapping | 9 | Coordinates, city query, lat/lon pairing, signup, search, settings, insights, `err.status` mapping, friendly 404 |
| Insights | 4 | Exactly 3 takeaways, unit formatting, LLM-less fallback, structured local analysis |
| Alerts | 1 | Current + forecast threshold matches and disabled state |
| **Total** | **22** | **22 passing** |

### Manual verification

| Flow | Result |
| :--- | :---: |
| Sign up → sign out → sign in → session restore | ✅ |
| City search, geocoding suggestions, keyboard navigation, history chips | ✅ |
| Geolocation allow / deny / coarse-accuracy warning | ✅ |
| Current conditions, hourly strip, charts, multi-day forecast | ✅ |
| AI briefing with LLM key and with rule-engine fallback | ✅ |
| Threshold alerts, official warnings, alert preview and history page | ✅ |
| Favorites add/remove across sessions | ✅ |
| °C/°F toggle and dark/light persistence | ✅ |
| Production build (`npm run build`) | ✅ |

---

## 10. Performance & Caching

| Measure | Implementation |
| :--- | :--- |
| Weather cache | In-memory `Map`, 600 s TTL (configurable via `CACHE_TTL_SECONDS`), capped at 300 entries |
| Insights cache | In-memory `Map`, 10-minute TTL, capped at 100 entries |
| Upstream timeout | 8 s hard ceiling on every weather request |
| LLM timeout | 9 s |
| Search | 300 ms debounce before geocoding |
| Code splitting | `ForecastCharts` is loaded with `React.lazy` / `Suspense` |
| Normalized payloads | Only view-model fields are sent to the browser; raw OWM payloads stay server-side |
| Production build (verified) | Main JS 203.13 kB (64.44 kB gzip); charts chunk 386.26 kB (106.74 kB gzip), loaded on demand |

---

## 11. Local Setup & Verification

### Prerequisites

- Node.js ≥ 18 (ES Modules + native `fetch`)
- MongoDB Atlas URI or local `mongodb://127.0.0.1:27017`
- Free OpenWeatherMap API key (new keys can take up to 2 hours to activate)

### Backend

```powershell
cd "Week4/Weather Application/backend"
npm install
# Create .env with PORT, MONGODB_URI, WEATHER_API_KEY, JWT_SECRET, CLIENT_ORIGIN
npm run dev    # → http://localhost:5000
npm test       # → 22/22 passing
```

### Frontend

```powershell
cd "Week4/Weather Application/frontend"
npm install
npm run dev    # → http://localhost:5173 (proxies /api to :5000)
npm run build  # → dist/
```

### Smoke checks

```powershell
curl http://localhost:5000/health
curl "http://localhost:5000/api/weather/current?city=Pune"
curl "http://localhost:5000/api/weather/forecast?city=Pune"
curl "http://localhost:5000/api/weather/search?q=Tokyo"
curl "http://localhost:5000/api/weather/insights?city=Pune&unit=C"
```

For authenticated smoke checks, sign in via `POST /api/auth/signin`, copy the token, and pass `Authorization: Bearer <token>` to `/api/weather/favorites`, `/api/weather/alerts/preview`, `/api/weather/alerts/history`, and `/api/settings`.

---

## 12. Known Limitations & Week 6 Roadmap

| Item | Status | Notes |
| :--- | :--- | :--- |
| Live deployment (Vercel + Render) | ✅ Complete | Frontend [weather-application-frontend-seven.vercel.app](https://weather-application-frontend-seven.vercel.app/) · backend [weather-application-s73i.onrender.com](https://weather-application-s73i.onrender.com/) — see [`deployment-guide.md`](deployment-guide.md) |
| Air Quality Index | ⏳ Deferred | No `/api/weather/air` route or AQI tile exists today |
| Offline detection + reconnect refresh | ⏳ Deferred | Current behavior is a friendly error banner only |
| Retry with exponential backoff | ⏳ Deferred | No automatic retry in `api.js` or `weatherService.js` |
| Stale-response guards | ⏳ Deferred | Dashboard fetches are not cancelled; search abort controller is not passed to `fetch` |
| PWA manifest + offline weather caching | ⏳ Deferred | Builds on future offline work |
| Animated condition backgrounds | ⏳ Deferred | Must respect reduced-motion preferences when added |
| Formal accessibility audit | ⏳ Deferred | Basic labels and keyboard support exist; no audit or automated a11y tests |
| Frontend component tests | ⏳ Deferred | Current suite is backend/unit only |
| Project 3 kickoff | ⏳ Week 6 | For strong students, per the Week 5 syllabus note |

---

## 13. Key Engineering Learnings

1. **Never expose third-party payloads directly to the UI.** Normalizing OpenWeatherMap responses inside `weatherService.js` means an upstream schema change is a one-file fix.
2. **The 3-hour forecast is not a daily forecast.** `/forecast` returns 40 entries; deriving “next 24 hours” and calendar-day buckets requires deliberate grouping by `dt` / `dt_txt`.
3. **OWM geocoding quirks matter.** The host is `api.openweathermap.org/geo/1.0`, and it matches complete words only — so free-text submit must remain available alongside suggestions.
4. **Row-level security is a query discipline.** Filtering every user-owned query by `req.user.id` plus unique compound indexes gives the MERN equivalent of row-level security.
5. **Rate limits are a product constraint.** A server-side TTL cache plus tiered limiters keeps free-tier usage predictable even with search-as-you-type.
6. **Progressive enhancement beats hard dependencies.** One Call 3.0 and the LLM are optional; the app stays fully usable when neither is available.
7. **Condition-aware theming via data attributes is cheap.** Setting `data-condition` on `<html>` and redefining `--accent` in CSS recolors every component without React re-renders.
8. **Code-split heavy libraries.** Lazy-loading recharts keeps the initial bundle small and loads chart code only when the dashboard has data.
9. **Completion is a verification exercise, not just a feature list.** Re-reading routes, services, and tests before writing Week 5 documentation removed several planned-but-unimplemented claims.

---

## 14. Deliverables & Verification Summary

| Artifact | Description | Status |
| :--- | :--- | :--- |
| [`Week5/README.md`](./README.md) | Week 5 completion summary and getting-started guide | ✅ Complete |
| [`Week5/documentation.md`](./documentation.md) | This technical documentation | ✅ Complete |
| [`Week5/project-2-completion-report.md`](./project-2-completion-report.md) | Project 2 comprehensive completion report | ✅ Complete |
| [`Week5/deployment-guide.md`](./deployment-guide.md) | Production readiness, environment matrix, smoke tests, rollback | ✅ Complete |
| Source — `Week4/Weather Application/backend` | Express + Mongoose API: weather proxy, auth, favorites, settings, alerts, insights | ✅ Complete |
| Source — `Week4/Weather Application/frontend` | React SPA: dashboard, charts, geolocation, auth, alert center, themes | ✅ Complete |
| Tests — `backend/tests/api.test.js` | **22 automated tests — 22/22 passing** | ✅ Complete |
| Production build | `npm run build` succeeds (`dist/` generated) | ✅ Verified |
| Live deployment — frontend | [weather-application-frontend-seven.vercel.app](https://weather-application-frontend-seven.vercel.app/) | ✅ Live |
| Live deployment — backend | [weather-application-s73i.onrender.com](https://weather-application-s73i.onrender.com/) | ✅ Live |
