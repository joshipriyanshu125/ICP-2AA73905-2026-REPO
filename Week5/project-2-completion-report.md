# Project 2: Weather Dashboard — Comprehensive Completion Report

**Internship Portal ID:** `ICP-2AA73905-2026`
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
**Deliverable:** Project 2 Full Completion & Documentation
**Internship Week:** Week 5
**Date:** October 2026

---

## 1. Executive Summary

Project 2 (Weather Dashboard Application) has reached **100% feature completeness**, full UI/UX polish, expanded automated verification, and production readiness — completing the Week 5 syllabus task *"Complete Project 2 with full functionality."*

The application delivers real-time weather intelligence on the MERN stack: a server-side OpenWeatherMap proxy (the API key never reaches the browser), geocoding search-as-you-type, hourly and multi-day forecasts, recharts visualizations, an Air Quality Index, AI-generated insights with a deterministic rule-engine fallback, configurable severe-weather alerts, per-user saved locations, and a condition-aware dark/light design system — now hardened with offline detection, retry with exponential backoff, an accessibility audit, and a **40-test automated suite at 100% pass rate**.

This report follows the structure established by [`Week3/project-1-completion-report.md`](../Week3/project-1-completion-report.md) for Project 1.

---

## 2. Feature & Functional Breakdown

### 2.1 Authentication & Account Layer
* **Sign-up / Sign-in:** Email + password with bcrypt hashing and JWT Bearer tokens (`Authorization: Bearer <token>`).
* **Session Restore:** Token persisted client-side; `AuthContext` silently restores the session on reload and redirects to `/auth` on a definitive 401.
* **Row-Level Scoping:** Favorites, search history, and settings always filter on `req.user.id`; compound unique index `{ user, city }` prevents duplicate saves.
* **Input Validation:** zod schemas on every mutating route with friendly, field-level messages.

### 2.2 Weather Data & Integration
* **Server-Side Proxy:** `weatherService.js` is the single egress point to OpenWeatherMap — current weather, 5-day/3-hour forecast, geocoding, and air pollution.
* **Progressive Enhancement:** One Call 3.0 is attempted first (7-day forecast + official alerts) with a circuit breaker that silently falls back to the free endpoints after 401/403.
* **Normalization:** Every upstream payload is mapped to a stable view model, so an OWM schema change is a one-file fix.
* **TTL Cache:** In-memory cache (600 s default) shields the free-tier quota; three rate-limiter tiers (weather / insights / auth) protect against abuse.
* **Timeouts:** `AbortSignal.timeout(8000)` on every external fetch — a hung upstream can never hang the API.

### 2.3 Dashboard & Visualization
* **Current Conditions Card:** Hero temperature, feels-like, humidity, wind, pressure, visibility, sunrise/sunset, favorite (★) toggle.
* **Stat Tiles:** Supplementary metric tiles (`StatTiles.jsx`).
* **Hourly Strip:** Next 24 hours in 3-hour slots with icons and rain probability (`HourlyStrip.jsx`).
* **Forecast Charts:** recharts temperature area curve + daily precipitation probability bars — lazy-loaded into a separate chunk to keep the main bundle small.
* **Multi-Day Forecast:** 5 days on the free plan, auto-upgrading to 7 with One Call 3.0 (`ForecastList.jsx`).

### 2.4 AI Insights with Rule-Engine Fallback
* `insightsService.js` calls an OpenAI-compatible `/chat/completions` endpoint (`OPENAI_API_KEY` or `AI_GATEWAY_API_KEY`).
* After 3 consecutive LLM failures the service enters a 10-minute cooldown and serves rule-engine insights.
* **The endpoint never fails because of the AI layer** — a guarantee verified by automated tests.
* Output: exactly 3 brief, actionable tips rendered above the hourly strip.

### 2.5 Severe-Weather Alerts
* **Custom Thresholds:** Per-user temperature and wind-speed limits stored in `UserSettings`, edited through `AlertSettings.jsx`.
* **Official Warnings:** One Call 3.0 alerts normalized into `AlertBanner.jsx` at the top of the dashboard.
* **History:** Deduplicated by fingerprint (`city|type|date`) and stored in `AlertHistory`, browsable at `/alerts`.
* **Live Preview:** `/api/weather/alerts/preview` evaluates all saved cities on demand.

### 2.6 Geolocation & Search
* **Auto-Locate:** Fresh high-accuracy fix on load (no cached position, no hardcoded default city) via the `useGeolocation` hook.
* **Permission States:** `idle → locating → granted / denied / unavailable`, with an accuracy badge that warns on coarse (>10 km) network positions.
* **Geocoding Search:** Debounced, keyboard-navigable suggestions via OWM Geocoding, plus free-text submit and recent-search chips.

### 2.7 Design System & Theme
* **Condition-Aware Accents:** `data-condition` on `<html>` redefines `--accent` in CSS — every card, chart, and chip recolors with zero React re-renders.
* **Dark / Light Modes:** Deep-sky dark + minimalistic light, system-preference default, `localStorage` persistence (`ThemeToggle.jsx`).
* **Unit Toggle:** °C ↔ °F applied client-side and persisted.
* **Head Metadata:** Per-route `title`, `description`, and `og:` tags for dashboard, auth, and alerts routes.

### 2.8 Week 5 — Resilience, Accessibility & Polish (New)
* **Offline Detection:** `useOnlineStatus` hook + `OfflineBanner.jsx` — a global banner appears on `offline`, data auto-refreshes on `online`.
* **Retry with Exponential Backoff:** 3 attempts (300 ms → 600 ms → 1200 ms) for network errors and transient 5xx responses, in both the frontend `api.js` client and the server-side weather fetch wrapper. 4xx client errors are **never** retried.
* **Stale-Response Guards:** `AbortController` cancels superseded search requests and a sequence token discards out-of-order responses.
* **Loading & Error States:** skeleton loaders while fetching, inline retry buttons on failure, friendly empty states everywhere.
* **Accessibility Audit:** skip-to-content link, visible focus rings, ARIA labels on all icon-only controls, `aria-live` regions for async results, chart text alternatives, contrast ≥ 4.5:1, `prefers-reduced-motion` respected.
* **Air Quality Index:** new `/api/weather/air` endpoint (OWM Air Pollution API) with AQI category, color coding, and PM2.5 / PM10 / O₃ / NO₂ breakdown.

---

## 3. Database Schema Overview (MongoDB / Mongoose)

```
+-------------------------------------------------------------+
|                          User                               |
| _id, name, email, passwordHash, createdAt                   |
+-------------------------------------------------------------+
      |                    |                    |
      v                    v                    v
+----------------+  +------------------+  +------------------+
| SearchHistory  |  |  FavoriteCity    |  |   UserSettings   |
| userId, city,  |  |  user + city     |  |  userId, unit,   |
| country, lat,  |  |  (unique pair),  |  |  tempMin,tempMax,|
| lon, lastTemp  |  |  addedAt         |  |  windMax         |
+----------------+  +------------------+  +------------------+
                                                  |
                                                  v
                                         +------------------+
                                         |   AlertHistory   |
                                         | userId, city,    |
                                         | type, message,   |
                                         | fingerprint,     |
                                         | firedAt          |
                                         +------------------+
```

**Collections:** `users`, `searchhistories`, `favoritecities`, `usersettings`, `alerthistories`.

---

## 4. Architecture at Completion

```text
+-------------------------------------------------------------------+
|              React 18 SPA (Vite — :5173)                          |
|   / (Dashboard)        /auth (Sign in/up)       /alerts (History) |
|   api.js → fetch + AbortController + retry/backoff + JWT header   |
+-------------------------------+-----------------------------------+
                                | HTTPS (JWT Bearer)
                                v
+-------------------------------------------------------------------+
|              Express API (:5000)                                  |
|   routes: auth · weather · settings  (+ /health)                  |
|   middleware: auth · validate(zod) · rateLimiter(3 tiers) ·       |
|               errorHandler                                        |
|   services: weatherService · insightsService · alertService       |
|   resilience: fetch timeout 8s · retry/backoff · TTL cache 600s   |
+-------------------------------+-----------------------------------+
                                | HTTPS (server-side only)
                                v
        +--------------------------------+   +---------------------+
        |  OpenWeatherMap REST APIs      |   |   OpenAI-compatible |
        |  weather · forecast · geocode  |   |   LLM (optional)    |
        |  air pollution · One Call 3.0  |   +---------------------+
        +--------------------------------+
                                |
                                v
                     +--------------------+
                     |    MongoDB         |
                     |  (users, history,  |
                     |   favorites,       |
                     |   settings, alerts)|
                     +--------------------+
```

---

## 5. Quality Assurance & Testing

### 5.1 Automated Test Suite — 40 tests, 40 pass

| Area | Examples |
| :--- | :--- |
| Forecast aggregation | 3-hour entries bucketed into calendar days, 5-day cap, next-24-hour window |
| Normalization | Current payload → view model, tolerant of missing fields, OneCall 7-day + alerts mapping |
| Validation (zod) | Coordinates, city query, lat/lon pairing, signup password/email, search query, settings thresholds, insights query |
| Error handling | `err.status` → HTTP code mapping, error taxonomy (404/401/429/timeout) |
| Insights | Rule engine returns exactly 3 insights, unit formatting, LLM-less fallback |
| Alerts | Current + forecast threshold matching, dedup fingerprinting |
| **Week 5 (new)** | Retry/backoff decision matrix (5xx retried, 4xx not), offline banner state machine, air-quality normalization, stale-response guard |

Runner: Node.js built-in `node:test` — **zero extra dependencies**, no live API or database required.

```bash
cd "Week4/Weather Application/backend"
npm test
```

### 5.2 Manual Verification Matrix

| Flow | Verified |
| :--- | :---: |
| Sign up → sign out → sign in → session restore | ✅ |
| Geocode search + keyboard navigation + recent chips | ✅ |
| Auto-locate, denied permission, coarse-accuracy warning | ✅ |
| Dashboard, hourly strip, charts, multi-day forecast | ✅ |
| AI insights (LLM path and rule-engine path) | ✅ |
| Threshold alerts + official warnings + history page | ✅ |
| Favorites add/remove across sessions | ✅ |
| °C/°F toggle and dark/light persistence | ✅ |
| Offline banner → reconnect → auto-refresh | ✅ |
| Full keyboard traversal + screen-reader labels | ✅ |
| Simulated 500/timeout → retry with backoff → recovery | ✅ |

---

## 6. Security Review

* **API key isolation:** `WEATHER_API_KEY` exists only in the backend environment; the frontend bundle contains zero third-party secrets.
* **Authentication:** bcrypt password hashing, signed JWTs with expiry, Bearer-only transmission.
* **Validation:** zod schemas reject malformed input before it reaches controllers.
* **Rate limiting:** 3 tiers (weather / insights / auth) with `NODE_ENV`-aware test bypass.
* **CORS:** explicit `CLIENT_ORIGIN` allowlist for API access.
* **Injection hygiene:** Mongoose parameterized queries; no raw user input in query strings.
* **Secrets:** `.env` is git-ignored across the repository; production secrets go through the host's environment settings.

---

## 7. Performance Observations

| Metric | Value |
| :--- | :--- |
| Main bundle (charts excluded) | ~186 kB (~60 kB gz) |
| recharts chunk (lazy) | ~386 kB, loaded on demand |
| Weather API response | < 600 ms typical with warm cache; cache hits are in-memory |
| External fetch timeout | 8 s hard ceiling |
| Retry policy | 3 attempts, exponential backoff 300 → 600 → 1200 ms |

---

## 8. Known Limitations & Future Enhancements

| Item | Target | Notes |
| :--- | :--- | :--- |
| Live deployment (Vercel + Render) | Week 6 | Steps, env matrix, and smoke tests finalized in [`deployment-guide.md`](deployment-guide.md) |
| PWA manifest + offline weather caching | Week 6 | Builds on the Week 5 offline detection |
| Animated weather backgrounds | Week 6 | Must respect `prefers-reduced-motion` (already wired) |
| Air quality forecast (5-day) | Optional | Current AQI is live-time only |
| Project 3 kickoff | Week 6 | For strong students, per the Week 5 syllabus note |

---

## 9. Deliverables Checklist

- [x] Project 2 completed with full functionality
- [x] [`Week5/README.md`](./README.md) — week summary and getting-started guide
- [x] [`Week5/documentation.md`](./documentation.md) — Week 5 technical documentation
- [x] [`Week5/project-2-completion-report.md`](./project-2-completion-report.md) — this report
- [x] [`Week5/deployment-guide.md`](./deployment-guide.md) — production readiness & go-live verification
- [x] 40 automated tests passing (100%)
- [x] Accessibility audit completed
- [x] Source code committed in `Week4/Weather Application/` (backend + frontend)
- [ ] Live production deployment — scheduled Week 6 (guide finalized)

---

**Project 2 (Weather Dashboard) is complete, documented, tested, and ready for production deployment.**
