# Project 2: Weather Dashboard — Comprehensive Completion Report

**Internship Portal ID:** `ICP-2AA73905-2026`
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
**Deliverable:** Project 2 Full Completion & Documentation
**Internship Week:** Week 5
**Date:** October 2026
**Status:** ✅ **Complete & deployed live** — [Frontend](https://weather-application-frontend-seven.vercel.app/) · [Backend API](https://weather-application-s73i.onrender.com/)

---

## 1. Executive Summary

Project 2 (Weather Dashboard Application) is **feature-complete, deployed, and verified live**. The implementation was delivered in Week 4 on the MERN stack: a server-side OpenWeatherMap proxy (the API key never reaches the browser), geocoding search-as-you-type, current conditions, hourly and multi-day forecasts, recharts visualizations, AI-generated insights with a deterministic rule-engine fallback, configurable severe-weather alerts, per-user saved locations, and a condition-aware dark/light design system.

Week 5 completes the project by verifying that implementation against the syllabus, running the automated suite (**22 tests, 22 passing**), confirming the production build, delivering the completion report and deployment guide, and **deploying the application live** — the React frontend on Vercel and the Express API on Render, backed by MongoDB Atlas. No new application source code was added in Week 5.

This report follows the structure established by [`Week3/project-1-completion-report.md`](../Week3/project-1-completion-report.md) for Project 1.

---

## 2. Feature & Functional Breakdown

### 2.1 Authentication & Account Layer
* **Sign-up / Sign-in:** Email + password with bcrypt hashing (10 rounds) and JWT Bearer tokens (`Authorization: Bearer <token>`).
* **Session Restore:** Token persisted in `localStorage`; `AuthContext` silently restores the session via `GET /api/auth/me` and clears the stored token if restore fails.
* **Row-Level Scoping:** Favorites, alert settings, and alert history always filter on `req.user.id`; compound unique index `{ user, city }` prevents duplicate saves.
* **Input Validation:** zod schemas on every mutating route with friendly, field-level messages.

### 2.2 Weather Data & Integration
* **Server-Side Proxy:** `weatherService.js` is the single egress point to OpenWeatherMap — current weather, 5-day/3-hour forecast, geocoding, and optional One Call 3.0.
* **Progressive Enhancement:** One Call 3.0 is attempted first (7-day forecast + official alerts) with a circuit breaker that silently falls back to the free endpoints after 401/403.
* **Normalization:** Every upstream payload is mapped to a stable view model, so an OWM schema change is a one-file fix.
* **TTL Cache:** In-memory cache (600 s default, max 300 entries) shields the free-tier quota.
* **Timeouts:** `AbortSignal.timeout(8000)` on every external fetch — a hung upstream cannot hang the API.

### 2.3 Dashboard & Visualization
* **Current Conditions Card:** Hero temperature, feels-like, humidity, wind, pressure, visibility, sunrise/sunset, and favorite (★) toggle.
* **Stat Tiles:** Humidity, wind, pressure, visibility, sunrise, and sunset (`StatTiles.jsx`).
* **Hourly Strip:** Next 24 hours in 3-hour slots with icons and rain probability (`HourlyStrip.jsx`).
* **Forecast Charts:** recharts temperature area curve + daily precipitation probability bars — lazy-loaded into a separate chunk.
* **Multi-Day Forecast:** 5 days on the free plan, auto-upgrading to 7 with One Call 3.0 (`ForecastList.jsx`).

### 2.4 AI Weather Briefing with Rule-Engine Fallback
* `insightsService.js` calls an OpenAI-compatible `/chat/completions` endpoint (`AI_GATEWAY_API_KEY` or `OPENAI_API_KEY`).
* After 3 consecutive LLM failures the service enters a 10-minute cooldown and serves rule-engine analysis.
* **The endpoint never fails because of the AI layer.**
* Output: summary, notable changes, suggested activities, precautions, and exactly 3 quick takeaways.

### 2.5 Severe-Weather Alerts
* **Custom Thresholds:** Per-user temperature and wind limits stored in `UserSettings`, edited through `AlertSettings.jsx`.
* **Official Warnings:** One Call 3.0 alerts normalized into `AlertBanner.jsx` at the top of the dashboard.
* **Alert Center:** `/alerts` page (`AlertsPage.jsx`) runs a live preview across saved locations and lists detected history.
* **History:** Deduplicated by fingerprint (`city|type|forecastFor`) and stored in `AlertHistory`.

### 2.6 Geolocation & Search
* **Auto-Locate:** Fresh high-accuracy fix on load (no cached position, no hardcoded default city) via `useGeolocation.js`.
* **Permission States:** `idle → locating → granted / denied / unavailable`, with a relaxed retry and an accuracy badge that warns on coarse (>10 km) positions.
* **Geocoding Search:** Debounced (300 ms), keyboard-navigable suggestions via OWM Geocoding, plus free-text submit and recent-search chips.
* **Search History:** Last 10 searched cities stored in MongoDB and shown as chips. History is shared across clients, not user-scoped.

### 2.7 Design System & Theme
* **Condition-Aware Accents:** `data-condition` on `<html>` redefines `--accent` in CSS — cards, charts, and chips recolor without React re-renders.
* **Dark / Light Modes:** Deep-sky dark + minimalistic light, system-preference default, `localStorage` persistence (`ThemeToggle.jsx`).
* **Unit Toggle:** °C ↔ °F applied client-side and persisted.
* **Head Metadata:** Per-route `title`, `description`, and `og:` tags for dashboard, auth, and alert routes.

### 2.8 Explicitly Not Implemented
The following were considered during planning but are **not** part of the delivered codebase:

* Air Quality Index endpoint or tile
* Offline detection banner / reconnect refresh
* Automatic retry with exponential backoff
* Stale-response guards / request cancellation on dashboard fetches
* PWA manifest, offline weather caching, animated backgrounds
* Formal accessibility audit or frontend component tests

They are recorded as future enhancements in §8.

---

## 3. Database Schema Overview (MongoDB / Mongoose)

```text
+-------------------------------------------------------------+
|                          User                               |
| _id, name, email (unique), passwordHash, createdAt          |
+-------------------------------------------------------------+
      |                    |                    |
      v                    v                    v
+------------------+  +------------------+  +------------------+
| SearchHistory    |  |  FavoriteCity    |  |   UserSettings   |
| city (unique),   |  |  user + city     |  |  user (unique),  |
| country, coords, |  |  (unique pair),  |  |  alertEnabled,   |
| count, lastTemp  |  |  country, label  |  |  minTempAlert,   |
|                  |  |                  |  |  maxWindAlert    |
+------------------+  +------------------+  +------------------+
                                                   |
                                                   v
                                          +------------------+
                                          |   AlertHistory   |
                                          | user, city, type,|
                                          | source, title,   |
                                          | message, value,  |
                                          | threshold,       |
                                          | fingerprint,     |
                                          | detectedAt       |
                                          +------------------+
```

**Collections:** `users`, `searchhistories`, `favoritecities`, `usersettings`, `alerthistories`.

**Indexes:**
- `users.email` — unique.
- `searchhistories.city` — unique (one row per city, trimmed to 10).
- `favoritecities { user, city }` — unique per account.
- `usersettings.user` — unique (one preferences row per account).
- `alerthistories { user, fingerprint }` — unique per detected event.

---

## 4. Architecture at Completion

```text
+-------------------------------------------------------------------+
|              React 18 SPA (Vite 5 — :5173)                        |
|   / (Dashboard)        /auth (Sign in/up)       /alerts (History) |
|   api.js → fetch + JWT header                                     |
+-------------------------------+-----------------------------------+
                                | HTTPS (JWT Bearer)
                                v
+-------------------------------------------------------------------+
|              Express API (:5000)                                  |
|   routes: auth · weather · settings  (+ /health)                  |
|   middleware: auth · validate(zod) · rateLimiter · errorHandler   |
|   services: weatherService · insightsService · alertService       |
|   resilience: 8 s fetch timeout · TTL cache 600 s · fallbacks     |
+-------------------------------+-----------------------------------+
                                | HTTPS (server-side only)
                                v
        +--------------------------------+   +---------------------+
        |  OpenWeatherMap REST APIs      |   |   OpenAI-compatible |
        |  weather · forecast · geocode  |   |   LLM (optional)    |
        |  One Call 3.0 (optional)       |   +---------------------+
        +--------------------------------+
                                |
                                v
                     +--------------------+
                     |    MongoDB         |
                     |  users, history,   |
                     |  favorites,        |
                     |  settings, alerts  |
                     +--------------------+
```

**Data flow:** `React UI → /api/weather/* → weatherController → weatherService → OpenWeatherMap → normalized view model → MongoDB (history/alerts)`.

**Auth flow:** `Sign up (/auth) → bcrypt hash → JWT → Bearer header → user-scoped queries`.

---

## 5. Quality Assurance & Testing

### 5.1 Automated Test Suite — 22 tests, 22 pass

| Area | Tests | Examples |
| :--- | ---: | :--- |
| Forecast aggregation & hourly strip | 4 | 3-hour entries bucketed into calendar days, 5-day cap, next-24-hour window, empty list |
| Normalization | 4 | Current payload → view model, tolerant of missing fields, One Call 7-day mapping, One Call alerts |
| Validation & error mapping | 9 | Coordinates, city query, lat/lon pairing, signup password/email, search query, settings thresholds, insights query, `err.status` mapping, friendly 404 |
| Insights | 4 | Exactly 3 takeaways, unit formatting, LLM-less fallback, structured local analysis |
| Alerts | 1 | Current + forecast threshold matches and disabled state |
| **Total** | **22** | **22/22 passing** |

Runner: Node.js built-in `node:test` — **zero extra dependencies**, no live API or database required.

```bash
cd "Week4/Weather Application/backend"
npm test
# → tests 22 · pass 22 · fail 0
```

### 5.2 Production Build Verification

```bash
cd "Week4/Weather Application/frontend"
npm run build
```

Verified output:
- Main JS: **203.13 kB** (64.44 kB gzip)
- Charts chunk: **386.26 kB** (106.74 kB gzip), loaded on demand
- CSS: **28.34 kB** (6.15 kB gzip)

### 5.3 Manual Verification Matrix

| Flow | Verified |
| :--- | :---: |
| Sign up → sign out → sign in → session restore | ✅ |
| Geocode search + keyboard navigation + recent chips | ✅ |
| Auto-locate, denied permission, coarse-accuracy warning | ✅ |
| Dashboard, hourly strip, charts, multi-day forecast | ✅ |
| AI briefing (LLM path and rule-engine path) | ✅ |
| Threshold alerts + official warnings + alert preview/history | ✅ |
| Favorites add/remove across sessions | ✅ |
| °C/°F toggle and dark/light persistence | ✅ |
| Invalid city shows a friendly error | ✅ |
| Production build succeeds | ✅ |

---

## 6. Security Review

* **API key isolation:** `WEATHER_API_KEY` exists only in the backend environment; the frontend bundle contains zero third-party secrets.
* **Authentication:** bcrypt password hashing (10 rounds), signed JWTs with expiry, Bearer-only transmission.
* **Validation:** zod schemas reject malformed input before it reaches controllers (HTTP 400).
* **Rate limiting:** weather 30/min, insights 10/min, auth 20 per 15 min.
* **CORS:** explicit `CLIENT_ORIGIN` allowlist for API access.
* **Injection hygiene:** Mongoose parameterized queries; no raw user input in query strings.
* **Row-level scoping:** favorites, settings, and alert history always filter by `req.user.id`.
* **Error hygiene:** 5xx details and stack traces are hidden in production.
* **Secrets:** `.env` is git-ignored; production secrets go through the host’s environment settings.

---

## 7. Performance Observations

| Metric | Value |
| :--- | :--- |
| Main bundle (charts excluded) | 203.13 kB (64.44 kB gzip) |
| recharts chunk (lazy) | 386.26 kB (106.74 kB gzip), loaded on demand |
| Weather API response | Cache hits are in-memory; uncached calls depend on OpenWeatherMap |
| External fetch timeout | 8 s hard ceiling |
| Weather cache | 600 s TTL, max 300 entries |
| Insights cache | 10-minute TTL, max 100 entries |
| Search debounce | 300 ms |

---

## 8. Known Limitations & Future Enhancements

**Live deployment is complete:** the frontend runs on [Vercel](https://weather-application-frontend-seven.vercel.app/) and the API on [Render](https://weather-application-s73i.onrender.com/). The production `/health` check returns `200 OK` with MongoDB connected and the weather API key configured. Deployment details and smoke tests are recorded in [`deployment-guide.md`](deployment-guide.md).

| Item | Target | Notes |
| :--- | :--- | :--- |
| Air Quality Index | Week 6 / optional | No `/api/weather/air` route or AQI tile exists today |
| Offline detection + reconnect refresh | Week 6 / optional | Current behavior is a friendly error banner |
| Retry with exponential backoff | Week 6 / optional | No automatic retry in `api.js` or `weatherService.js` |
| Stale-response guards | Week 6 / optional | Dashboard fetches are not cancelled; search abort controller is not wired to `fetch` |
| PWA manifest + offline weather caching | Week 6 / optional | Builds on future offline work |
| Animated weather backgrounds | Week 6 / optional | Must respect reduced-motion preferences when added |
| Formal accessibility audit | Future | Basic ARIA labels and keyboard support exist |
| Frontend component tests | Future | Current suite is backend/unit only |
| Project 3 kickoff | Week 6 | For strong students, per the Week 5 syllabus note |

---

## 9. Deliverables Checklist

- [x] Project 2 completed with full functionality
- [x] [`Week5/README.md`](./README.md) — completion summary and getting-started guide
- [x] [`Week5/documentation.md`](./documentation.md) — technical documentation of the as-built project
- [x] [`Week5/project-2-completion-report.md`](./project-2-completion-report.md) — this report
- [x] [`Week5/deployment-guide.md`](./deployment-guide.md) — production readiness & go-live verification
- [x] 22 automated tests passing (22/22)
- [x] Production build verified (`dist/` generated)
- [x] Source code in `Week4/Weather Application/` (backend + frontend)
- [x] Live production deployment — frontend on [Vercel](https://weather-application-frontend-seven.vercel.app/), backend on [Render](https://weather-application-s73i.onrender.com/)
- [x] Production health check and weather endpoint verified (`200 OK`, valid JSON, CORS allowed)

---

**Project 2 (Weather Dashboard) is complete, documented, tested, deployed, and verified live.**
