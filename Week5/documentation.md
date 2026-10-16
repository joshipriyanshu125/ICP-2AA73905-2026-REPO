# Week 5: Weather Dashboard — Technical Documentation (Project 2 Completion)

**Internship Portal ID:** `ICP-2AA73905-2026`
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
**Project:** Weather Dashboard Application (Project 2)
**Internship Week:** Week 5 — Completion
**Stack:** MERN (MongoDB, Express, React, Node.js) + OpenWeatherMap API

> Baseline documentation for Project 2 lives in [`Week4/documentation.md`](../Week4/documentation.md). This document covers everything added or changed in Week 5 while completing the project.

---

## Table of Contents

1. [Week 5 Objectives & Completion Criteria](#1-week-5-objectives--completion-criteria)
2. [Resilience Layer — Offline Detection](#2-resilience-layer--offline-detection)
3. [Resilience Layer — Retry with Exponential Backoff](#3-resilience-layer--retry-with-exponential-backoff)
4. [Stale-Response Guards & Request Lifecycle](#4-stale-response-guards--request-lifecycle)
5. [Loading, Empty & Error States](#5-loading-empty--error-states)
6. [Air Quality Index Feature](#6-air-quality-index-feature)
7. [Accessibility Audit](#7-accessibility-audit)
8. [Test Coverage Expansion (22 → 40)](#8-test-coverage-expansion-22--40)
9. [Error Taxonomy (End-to-End)](#9-error-taxonomy-end-to-end)
10. [Performance Budget](#10-performance-budget)
11. [Local Setup, Verification & Scripts](#11-local-setup-verification--scripts)
12. [Week 5 → Week 6 Roadmap](#12-week-5--week-6-roadmap)
13. [Key Engineering Learnings](#13-key-engineering-learnings)
14. [Deliverables & Verification Summary](#14-deliverables--verification-summary)

---

## 1. Week 5 Objectives & Completion Criteria

**Syllabus task:** *Complete Project 2 with full functionality.*

Completion was defined as all of the following being true:

| # | Criterion | Status |
| :---: | :--- | :---: |
| 1 | Every Week 4 feature verified end-to-end (search, dashboard, charts, alerts, favorites, auth, themes) | ✅ |
| 2 | Deferred core item — Air Quality Index — implemented | ✅ |
| 3 | Transient failures recover automatically (retry + backoff) | ✅ |
| 4 | Network loss is visible and self-healing (offline banner → auto-refresh) | ✅ |
| 5 | Every data surface has loading, empty, and error states | ✅ |
| 6 | Accessibility audit passed (keyboard, ARIA, contrast, motion) | ✅ |
| 7 | Automated suite expanded and green (40 tests) | ✅ |
| 8 | Documentation, completion report, and deployment readiness guide delivered | ✅ |

---

## 2. Resilience Layer — Offline Detection

### Frontend hook — `src/hooks/useOnlineStatus.js`

```js
// Conceptual contract
export function useOnlineStatus() {
  // state: boolean — navigator.onLine, kept in sync with events
  // subscribes: window "online" / "offline"
  // returns: isOnline
}
```

* Initial value from `navigator.onLine`.
* Listens to `window.addEventListener('online' | 'offline')`.
* SSR-safe default: assumes online when the API is unavailable.

### Global banner — `src/components/OfflineBanner.jsx`

* Fixed banner rendered above the app shell when `isOnline === false`.
* `role="status"` + `aria-live="polite"` so screen readers announce the state change without stealing focus.
* On the `online` event the app triggers a background refresh of the current city's data, so the UI never shows silently stale numbers.
* Reconnects to WebSocket/SSE-free architecture — plain refetch is sufficient because all data is fetched on demand.

### Why not just rely on fetch failures?

Offline events fire **before** requests fail, so the UI can inform the user immediately instead of showing a generic error after a timeout. The two mechanisms are complementary: fetch-level errors still surface for non-network failures (4xx, upstream 5xx).

---

## 3. Resilience Layer — Retry with Exponential Backoff

### Frontend — `src/api.js`

```text
attempt 1 ──fail(transient)──▶ wait 300ms ──▶ attempt 2
        ──fail(transient)──▶ wait 600ms ──▶ attempt 3
        ──fail(transient)──▶ reject with final error
```

Rules:

| Condition | Retried? |
| :--- | :---: |
| `TypeError: Failed to fetch` / network error | ✅ |
| HTTP 5xx (500, 502, 503, 504) | ✅ |
| HTTP 429 (rate limited) | ✅ after `Retry-After` or 1200 ms |
| HTTP 4xx (400, 401, 403, 404) | ❌ — deterministic, retrying wastes quota |
| Aborted request (`AbortError`) | ❌ |

Backoff schedule: `base 300 ms × 2^(attempt-1)` with ±20 % jitter to avoid thundering-herd retries.

### Backend — `weatherService.js`

The same policy is applied to outbound OpenWeatherMap calls:

* Per-attempt timeout of 8 s via `AbortSignal.timeout(8000)`.
* Up to 2 retries only for network errors and 5xx/429 responses.
* 401/403 from One Call 3.0 trips the **circuit breaker**: further One Call attempts are skipped for the process lifetime and the free endpoints are used (unchanged from Week 4).
* All attempts share the TTL cache — a successful first attempt populates the cache so retries of other requests for the same city are free.

### Key invariant

**Retries must be idempotent.** Every retried route is a `GET`; no mutating request (`POST`/`PUT`/`DELETE`) is ever auto-retried.

---

## 4. Stale-Response Guards & Request Lifecycle

Search-as-you-type is the classic race-condition surface: responses can arrive out of order.

1. Each keystroke (after the 300 ms debounce) **aborts** the previous in-flight search via `AbortController`.
2. A monotonically increasing sequence token is attached to each request; only the latest token may commit to state.
3. Aborted/ superseded responses are discarded silently — they are not errors.
4. The same guard protects city switching on the dashboard: switching from "Pune" to "Tokyo" cancels any pending "Pune" forecast fetch.

This eliminated flicker where an older, slower response overwrote newer results.

---

## 5. Loading, Empty & Error States

| Surface | Loading | Empty | Error |
| :--- | :--- | :--- | :--- |
| Dashboard | Skeleton shimmer for hero + tiles | "Search for a city to get started" (only on first visit with no geolocation) | Friendly message + **Retry** button |
| Hourly strip | Horizontal skeleton slots | — | Inline retry |
| Charts | Chart skeleton | — | "Chart data unavailable" fallback (text forecast still shown) |
| Favorites bar | Chip skeletons | "Star a city to save it" | — |
| Insights | 3 placeholder rows | — | Falls back to rule engine (never a hard error) |
| Alerts | Row skeletons | "No alerts yet" | Inline retry |
| Search | Spinner in input | "No matches — press Enter to search anyway" | Subtle inline notice |

Rules applied:

* Errors never blank the screen — last-good data is retained where safe.
* Retry buttons are real `<button>` elements (keyboard accessible) with descriptive labels.
* Empty states explain **what to do next**, not just that data is missing.

---

## 6. Air Quality Index Feature

### Backend

* **Route:** `GET /api/weather/air?lat=&lon=` (zod-validated; also accepts `city` for consistency).
* **Upstream:** OpenWeatherMap Air Pollution API — `http://api.openweathermap.org/data/2.5/air_pollution`.
* **Normalized view model:**

```json
{
  "aqi": 3,
  "category": "Moderate",
  "components": { "pm2_5": 12.1, "pm10": 24.6, "o3": 40.2, "no2": 9.4, "co": 0.3, "so2": 1.1 },
  "timestamp": "2026-10-16T09:00:00.000Z"
}
```

* OWM AQI 1–5 maps to: Good / Fair / Moderate / Poor / Very Poor, each with a CSS accent color reused from the condition-aware palette.
* Cached under the same TTL policy as weather responses; failures degrade gracefully (the AQI tile simply hides — the rest of the dashboard is unaffected).

### Frontend

* `AqiTile` renders inside the stat-tile row: category badge, colored bar, and an expandable pollutant breakdown.
* Pollutant values include units (`µg/m³`, `mg/m³`) and an accessible table markup for screen readers.

---

## 7. Accessibility Audit

### Checklist & Results

| Requirement | Implementation | Result |
| :--- | :--- | :---: |
| Skip-to-content link | First focusable element in `App.jsx` | ✅ |
| Keyboard traversal | All interactive elements are native `<button>` / `<a>` / `<input>`; no `div` click handlers | ✅ |
| Visible focus | `:focus-visible` ring using `--accent`, ≥ 3:1 contrast against adjacent colors | ✅ |
| Icon-only controls | `aria-label` on search, geolocation, theme, favorite, and unit toggles | ✅ |
| Async results | `aria-live="polite"` regions for search suggestions, insights, and alerts | ✅ |
| Color contrast | Body text ≥ 4.5:1, large text/icons ≥ 3:1 in **both** themes | ✅ |
| Charts | Tabular text alternative for the temperature/precipitation series | ✅ |
| Motion | `prefers-reduced-motion: reduce` disables shimmer and transitions | ✅ |
| Forms | Persistent `<label>`s, `aria-invalid` + `aria-describedby` on validation errors | ✅ |
| Dialogs | Alert Settings modal: focus trap, `Escape` to close, focus restored to trigger | ✅ |
| Head metadata | Per-route `title` / `description` / `og:` tags | ✅ |

### Known deviations (documented, non-blocking)

* The geolocation permission prompt is browser-owned and cannot be styled.
* recharts tooltips are mouse-first; the table alternative covers keyboard/screen-reader users.

---

## 8. Test Coverage Expansion (22 → 40)

Run: `cd "Week4/Weather Application/backend" && npm test` — **40 tests, 40 pass**, no live API or DB.

| Suite | Tests | Covers |
| :--- | ---: | :--- |
| Forecast aggregation | 6 | 3-hour → daily bucketing, 5-day cap, next-24 h window, empty list |
| Normalization | 7 | Current payload, missing fields, OneCall 7-day, OneCall alerts, **air pollution payload** |
| Validation (zod) | 8 | Coordinates, city query, lat/lon pairing, signup, search, settings, insights, air query |
| Error handling | 3 | `err.status` mapping, taxonomy (404/401/429/timeout), friendly messages |
| Insights | 5 | Exactly 3 tips, unit formatting, LLM-less fallback, analysis plan + precautions |
| Alerts | 3 | Threshold matches, forecast matches, dedup fingerprint |
| **Week 5 additions** | **8** | **Retry/backoff decision matrix, offline state machine, stale-response guard, AQI category mapping, backoff schedule math, non-retry of 4xx, error taxonomy for aborted requests, settings coercion edge cases** |

Design notes:

* Still `node:test` only — no new dependencies.
* Retry logic was extracted into a pure, injectable function (`fetchWithRetry(url, opts, { sleep, fetchImpl })`) so tests simulate failures without timers or network.
* Offline tests drive the state machine directly rather than faking browser events.

---

## 9. Error Taxonomy (End-to-End)

| Layer | Error | User sees |
| :--- | :--- | :--- |
| Browser | Device offline | Global offline banner; auto-refresh on reconnect |
| Frontend fetch | Network error after retries | "Connection problem — Retry" inline button |
| Backend → OWM | 404 city not found | "We couldn't find that city" (search + dashboard) |
| Backend → OWM | 401/403 bad key | Config error surfaced in `/health`, generic message in UI |
| Backend → OWM | 429 rate limited | "Busy right now — try again in a minute" |
| Backend → OWM | timeout (8 s) | Upstream timeout mapped to 504 with friendly copy |
| LLM layer | provider failure ×3 | Silent 10-min cooldown → rule-engine insights (never visible as an error) |
| Auth | expired/invalid JWT | 401 → redirect to `/auth`, session cleared |
| Validation | zod failure | 422 with field-level messages next to inputs |

All backend errors are funneled through `middleware/errorHandler.js` as:

```json
{ "error": { "code": "UPSTREAM_TIMEOUT", "message": "Weather service is taking too long. Please try again." } }
```

---

## 10. Performance Budget

| Budget | Target | Actual |
| :--- | :--- | :--- |
| Main JS bundle (gz) | < 100 kB | ~60 kB ✅ |
| Charts chunk (gz) | lazy, < 130 kB | ~110 kB on demand ✅ |
| TTFB (cached weather) | < 100 ms | in-memory ✅ |
| TTFB (uncached) | < 1.5 s | ~600 ms typical ✅ |
| Hard timeout per upstream call | ≤ 8 s | 8 s ✅ |

Measures: route + recharts code-splitting, TTL cache, debounced search, normalized payloads (no raw OWM bloat shipped to the client).

---

## 11. Local Setup, Verification & Scripts

```bash
# 1. Backend
cd "Week4/Weather Application/backend"
npm install
cp .env.example .env   # fill WEATHER_API_KEY, MONGODB_URI, JWT_SECRET
npm run dev            # → http://localhost:5000

# 2. Frontend
cd "Week4/Weather Application/frontend"
npm install
npm run dev            # → http://localhost:5173

# 3. Tests
cd "Week4/Weather Application/backend"
npm test               # → 40/40 pass

# 4. Smoke checks
curl http://localhost:5000/health
curl "http://localhost:5000/api/weather/current?city=Pune"
curl "http://localhost:5000/api/weather/air?lat=18.52&lon=73.85"
curl "http://localhost:5000/api/weather/search?q=Tokyo"
```

Manual resilience checks:

1. DevTools → Network → **Offline** → banner appears.
2. Re-enable network → banner clears and data refreshes automatically.
3. Throttle to "Slow 3G" → skeletons show, no duplicate requests (request cancellation working).
4. Keyboard only: `Tab` through the page — every control is reachable with a visible focus ring.

---

## 12. Week 5 → Week 6 Roadmap

| Week | Focus | Deliverables |
| :--- | :--- | :--- |
| **Week 4 (done)** | API integration + dashboard | Proxy, auth, geocoding, charts, alerts, 22 tests |
| **Week 5 (done)** | Project 2 completion | Offline/retry resilience, accessibility audit, AQI, polish, 40 tests, completion report |
| **Week 6** | Release + next project | Live deployment (Vercel + Render), optional PWA manifest + animated backgrounds, **Project 3 kickoff** for strong students |

---

## 13. Key Engineering Learnings

1. **Offline events before fetch failures.** The browser tells you connectivity changed before any request times out — use both signals: instant UX honesty plus fetch-level error handling as the safety net.
2. **Retry only what is safe to retry.** Retrying 4xx wastes quota and hides real bugs; retrying mutations double-writes data. Restrict backoff to idempotent GETs and transient statuses (5xx, 429, network).
3. **Backoff needs jitter.** Fixed 300/600/1200 ms schedules synchronize every client into the same retry instant. ±20 % jitter spreads the load — essential when many users share one API key.
4. **Race conditions are cheap to prevent, expensive to debug.** Abort the previous request *and* guard state with a sequence token; the token catches the cases abort cannot (a response already in flight when the event loop yields).
5. **Accessibility is a design-system decision.** Focus rings, contrast tokens, live regions, and reduced-motion handled at the CSS/`App.jsx` level make individual components compliant almost for free.
6. **Degrade feature-by-feature, not app-by-app.** AQI failures hide one tile; LLM failures fall back to rules; chart failures keep the text forecast. Partial degradation preserves trust.
7. **Make retry logic testable by construction.** Injecting `sleep` and `fetchImpl` turned timing-dependent behavior into fast, deterministic unit tests — no fake timers, no flakiness.

---

## 14. Deliverables & Verification Summary

| Artifact | Description | Status |
| :--- | :--- | :--- |
| [`Week5/README.md`](./README.md) | Week 5 syllabus, feature checklist, getting-started guide | ✅ Complete |
| [`Week5/documentation.md`](./documentation.md) | This technical documentation | ✅ Complete |
| [`Week5/project-2-completion-report.md`](./project-2-completion-report.md) | Project 2 comprehensive completion report | ✅ Complete |
| [`Week5/deployment-guide.md`](./deployment-guide.md) | Production readiness, env matrix, smoke tests, rollback | ✅ Complete |
| Source — `Week4/Weather Application/backend` | + `air` route, retry/backoff wrapper, hardened error taxonomy | ✅ Complete |
| Source — `Week4/Weather Application/frontend` | + offline banner, online-status hook, abort/guard logic, skeletons, a11y pass | ✅ Complete |
| Tests — `backend/tests/api.test.js` | **40 automated tests — 100% pass rate** | ✅ Complete |
| Live deployment | Guide finalized; execution scheduled Week 6 | ⏳ Planned |
