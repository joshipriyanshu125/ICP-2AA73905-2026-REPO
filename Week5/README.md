
# Week 5: Project 2 Completion — Weather Dashboard Application

## Intern Career Path — Web Development
**Portal ID:** `ICP-2AA73905-2026`
**Repository:** ICP-2AA73905-2026-REPO
**Internship Week:** Week 5
**Project:** Weather Dashboard Application (Project 2) — **Completion Week**

---

## 📋 Overview

Week 5 is the **Project 2 completion week**. The Weather Dashboard Application was started in Week 4 (external API integration, asynchronous data fetching, and data visualization). This week closes every remaining gap so that Project 2 ships with **full functionality**, then hardens it with resilience, accessibility, performance, and expanded automated testing.

Work builds directly on:

- [`Week4/README.md`](../Week4/README.md) — Project 2 baseline (started)
- [`Week4/documentation.md`](../Week4/documentation.md) — full technical documentation of the baseline
- [`Week2/documentation.md`](../Week2/documentation.md) — core architectural patterns (Project 1)
- [`Week3/project-1-completion-report.md`](../Week3/project-1-completion-report.md) — the completion-report format reused below

---

## 🎯 Objectives & Deliverables

**Task (Week 5 syllabus):**
- Complete Project 2 with full functionality
- Strong students may begin Project 3

**Deliverables:**
- Completed Project 2
- Completion report, updated documentation, and deployment readiness guide

| Target Task | Status | Implementation Details |
| :--- | :---: | :--- |
| **Complete Project 2 Core Scope** | ✅ Complete | Every Week 4 feature verified end-to-end and signed off — see [`project-2-completion-report.md`](project-2-completion-report.md) |
| **Offline Detection** | ✅ Complete | `useOnlineStatus` hook + `OfflineBanner.jsx` — global connection banner, auto-refresh on reconnect |
| **Retry with Backoff** | ✅ Complete | Exponential backoff (3 attempts, 300 ms → 1.2 s) for transient 5xx/network failures in `api.js` and the server-side weather fetch wrapper |
| **Stale-Response Guards** | ✅ Complete | Request cancellation (`AbortController`) + sequence tokens so out-of-order search results never clobber newer input |
| **Loading & Error States** | ✅ Complete | Skeleton loaders, inline retry buttons, friendly empty states on every data surface |
| **Accessibility Audit** | ✅ Complete | Keyboard traversal, visible focus rings, skip-to-content link, ARIA labels/live regions, contrast ≥ 4.5:1, `prefers-reduced-motion` support |
| **Air Quality Index (AQI)** | ✅ Complete | New `/api/weather/air` endpoint (OWM Air Pollution API) + AQI tile with pollutant breakdown (PM2.5, PM10, O₃, NO₂) |
| **Session & Profile Polish** | ✅ Complete | Silent session restore, 401 auto-redirect, sign-out everywhere, per-user settings persistence |
| **Test Coverage Expansion** | ✅ Complete | **40 automated tests** (22 baseline + 18 new: backoff, offline handling, air quality normalization, error taxonomy) |
| **Documentation & Report** | ✅ Complete | This README, full documentation update, completion report, and production-readiness deployment guide |
| **Production Readiness** | ✅ Complete | Environment matrix, smoke-test script, health checks, rollback plan — go-live scheduled for Week 6 |

---

## 🏗️ Project Structure

```
Week5/
├── README.md                        # This file — week summary and getting-started guide
├── documentation.md                 # Week 5 technical documentation (resilience, a11y, AQI, tests)
├── project-2-completion-report.md   # Project 2 comprehensive completion report
├── deployment-guide.md              # Production readiness & go-live verification guide
└── (Project 2 source code lives in Week4/Weather Application/)
    ├── backend/                     # Express + Mongoose API (extended in Week 5)
    │   ├── src/routes/air.js        # 🆕 Air quality endpoint
    │   ├── src/services/weatherService.js  # + AQI normalization, retry/backoff wrapper
    │   └── tests/api.test.js        # 40 tests (22 → 40)
    └── frontend/                    # React + Vite SPA (extended in Week 5)
        └── src/
            ├── hooks/useOnlineStatus.js   # 🆕 Network state hook
            ├── components/OfflineBanner.jsx # 🆕 Global offline banner
            └── api.js                     # + AbortController, retry with backoff
```

> **Note:** Week 5 is a documentation and hardening week. Source changes are committed into the existing `Week4/Weather Application/` tree so Project 2 remains a single, coherent codebase; this folder holds the week's reports and guides.

---

## ✅ Project 2 — Final Feature Checklist

### Data & Integration
- [x] Server-side OpenWeatherMap proxy (key never reaches the browser)
- [x] Current conditions, 5-day/3-hour forecast, geocoding search
- [x] Hourly strip (next 24 h) + multi-day forecast list
- [x] recharts temperature curve + precipitation probability chart
- [x] Air Quality Index with pollutant breakdown
- [x] In-memory TTL cache + 3-tier rate limiting

### Intelligence & Alerts
- [x] AI weather insights (LLM with deterministic rule-engine fallback)
- [x] Custom temperature/wind threshold alerts
- [x] Official One Call 3.0 warnings (progressive enhancement)
- [x] Alert history (deduplicated by fingerprint)

### Accounts & Personalization
- [x] Email/password auth (bcrypt + JWT), silent session restore
- [x] Per-user saved locations, search history, alert settings
- [x] °C ↔ °F unit toggle (persisted)
- [x] Dark / light theme with condition-aware accents

### Resilience, Accessibility & Quality (Week 5)
- [x] Offline detection + auto-recovery banner
- [x] Retry with exponential backoff for transient failures
- [x] Stale-response guards on search
- [x] Skeleton loaders, retry buttons, empty states
- [x] Keyboard navigation, ARIA labels, live regions, contrast pass
- [x] Per-route head metadata (title/description/og)
- [x] 40 automated tests — 100% pass rate

### Deferred to Week 6 (optional enhancements)
- [ ] PWA manifest + offline weather caching
- [ ] Animated condition backgrounds
- [ ] Live production deployment (Vercel + Render) — guide already finalized in [`deployment-guide.md`](deployment-guide.md)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- OpenWeatherMap API key (free plan is sufficient)

### Installation

```bash
git clone https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git
cd ICP-2AA73905-2026-REPO/Week4   # Project 2 source lives here

# Terminal 1 — backend
cd "Weather Application/backend"
npm install
npm run dev        # → http://localhost:5000

# Terminal 2 — frontend
cd "Weather Application/frontend"
npm install
npm run dev        # → http://localhost:5173
```

### Required backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://... or mongodb://127.0.0.1:27017/weather_dashboard
WEATHER_API_KEY=your_openweathermap_api_key
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=a_long_random_string
# Optional: OPENAI_API_KEY / AI_GATEWAY_API_KEY for LLM insights
```

### Running Tests

```bash
cd "Weather Application/backend"
npm test
# → 40 tests, 40 pass (node:test — no live API or DB required)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router 6, Vite 5, recharts 2 (lazy-loaded), vanilla CSS design system |
| **Backend** | Node.js 18+ (ES Modules), Express 4, Mongoose 8, zod, bcryptjs + jsonwebtoken |
| **Database** | MongoDB — `users`, `searchhistories`, `favoritecities`, `usersettings`, `alerthistories` |
| **External APIs** | OpenWeatherMap — Current, Forecast, Geocoding, Air Pollution, One Call 3.0 (optional) |
| **AI Layer** | OpenAI-compatible chat completions + deterministic rule-engine fallback |
| **Resilience** | Retry with exponential backoff, `AbortController` timeouts, offline detection, TTL cache |
| **Quality** | `node:test` — 40 tests; accessibility audit; per-route meta/og tags |
| **Build** | Vite 5 (dev proxy for `/api` + `/health`) |

---

## 📡 API Endpoints

| Method | Route | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | — | Server + DB status check |
| `POST` | `/api/auth/signup` | — | Register with name, email, password |
| `POST` | `/api/auth/login` | — | Sign in, receive JWT |
| `GET` | `/api/weather/current` | — | Current conditions (city or lat/lon) |
| `GET` | `/api/weather/forecast` | — | Hourly strip + daily forecast |
| `GET` | `/api/weather/search` | — | Geocoding suggestions |
| `GET` | `/api/weather/insights` | — | AI/rule-engine insights |
| `GET` | `/api/weather/air` 🆕 | — | Air Quality Index + pollutant breakdown |
| `GET` | `/api/weather/history` | — | Recent search history |
| `DELETE` | `/api/weather/history` | — | Clear search history |
| `GET` | `/api/weather/favorites` | ✅ | List saved cities |
| `POST` | `/api/weather/favorites` | ✅ | Save a city |
| `DELETE` | `/api/weather/favorites/:city` | ✅ | Remove a saved city |
| `GET` | `/api/weather/alerts/preview` | ✅ | Live alert check across saved cities |
| `GET` | `/api/weather/alerts/history` | ✅ | Stored alert history |
| `GET` | `/api/settings` | ✅ | Get alert preferences |
| `PUT` | `/api/settings` | ✅ | Update alert thresholds |

---

## 📚 Reference Documentation

| Document | Description |
| :--- | :--- |
| [`documentation.md`](documentation.md) | Week 5 technical documentation |
| [`project-2-completion-report.md`](project-2-completion-report.md) | Project 2 comprehensive completion report |
| [`deployment-guide.md`](deployment-guide.md) | Production readiness & go-live verification |
| [`../Week4/documentation.md`](../Week4/documentation.md) | Project 2 baseline documentation |
| [`../Week3/project-1-completion-report.md`](../Week3/project-1-completion-report.md) | Project 1 completion report (format reference) |

---

## 🔭 Roadmap

| Week | Focus | Deliverables |
| :--- | :--- | :--- |
| **Week 4 (done)** | API integration + dashboard | Proxy, auth, geocoding, charts, alerts, 22 tests |
| **Week 5 (done)** | Project 2 completion | Resilience, accessibility, AQI, polish, 40 tests, completion report |
| **Week 6** | Release + next project | Live deployment (Vercel + Render), optional PWA/animations, **Project 3** kickoff for strong students |

---

## 📬 Contact & Support

- **Repository:** [ICP-2AA73905-2026-REPO](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
- **Portal ID:** `ICP-2AA73905-2026`
- **Internship Track:** Web Development Self-Learning Program
- **Module:** Week 5 — Project 2 Completion (Resilience, Accessibility & Quality)
