
# Week 5: Project 2 Completion — Weather Dashboard Application

## Intern Career Path — Web Development
**Portal ID:** `ICP-2AA73905-2026`
**Repository:** ICP-2AA73905-2026-REPO
**Internship Week:** Week 5
**Project:** Weather Dashboard Application (Project 2) — **Completion Week**
**Status:** ✅ **Deployed live** — Vercel (frontend) + Render (backend)

---

## 📋 Overview

Week 5 is the **Project 2 completion week**. The Weather Dashboard Application was implemented end-to-end in Week 4 — external API integration, asynchronous data fetching, data visualization, authentication, AI insights, and severe-weather alerts. Week 5 verifies that implementation against the syllabus, records the final feature inventory, runs the automated suite, and delivers the completion report, production deployment guide, and **live production deployment**.

> **Scope note:** Week 5 does **not** add new application source code. The Project 2 codebase remains in [`Week4/Weather Application/`](../Week4/Weather%20Application/), and every document in this folder describes that as-built implementation. Planned enhancements that were **not** implemented — Air Quality Index, offline detection, retry/backoff, and PWA caching — are listed as future work, not as completed features.

Work builds directly on:

- [`Week4/README.md`](../Week4/README.md) — Project 2 implementation summary and getting-started guide
- [`Week4/documentation.md`](../Week4/documentation.md) — full baseline technical documentation
- [`Week4/deployment-guide.md`](../Week4/deployment-guide.md) — original deployment plan
- [`Week2/documentation.md`](../Week2/documentation.md) — core architectural patterns (Project 1)
- [`Week3/project-1-completion-report.md`](../Week3/project-1-completion-report.md) — the completion-report format reused below

---

## 🌐 Live Deployment

| Service | Platform | Live URL | Status |
| :--- | :--- | :--- | :---: |
| **Frontend** | Vercel | [https://weather-application-frontend-seven.vercel.app/](https://weather-application-frontend-seven.vercel.app/) | ✅ Live |
| **Backend API** | Render | [https://weather-application-s73i.onrender.com/](https://weather-application-s73i.onrender.com/) | ✅ Live |
| **Health check** | Render | [https://weather-application-s73i.onrender.com/health](https://weather-application-s73i.onrender.com/health) | ✅ `200 OK` |
| **Database** | MongoDB Atlas | _cluster private_ | ✅ Connected |

> **Verified 20 October 2026:** `/health` returns `200 OK` with `database: "connected"` and `weatherApi: "configured"`; `/api/weather/current`, `/forecast`, `/search`, and `/insights` return `200`; protected routes return `401` without a token; and the production frontend origin is allowed by CORS. Render free-tier services may take 20–60 s to wake after inactivity.

---

## 🎯 Objectives & Deliverables

**Task (Week 5 syllabus):**
- Complete Project 2 with full functionality
- Strong students may begin Project 3

**Deliverables:**
- Completed Project 2
- Completion report, updated documentation, deployment guide, and **live production deployment**

| Target Task | Status | Implementation Details |
| :--- | :---: | :--- |
| **Complete Project 2 Core Scope** | ✅ Complete | Full feature set delivered in Week 4 and verified against the source — see [`project-2-completion-report.md`](project-2-completion-report.md) |
| **OpenWeatherMap Integration** | ✅ Complete | Server-side proxy for current conditions, 5-day/3-hour forecast, geocoding, and optional One Call 3.0 (7-day + official alerts) |
| **City Search with Geocoding** | ✅ Complete | Debounced, keyboard-navigable suggestions via OWM Geocoding API, plus free-text submit and recent-search chips |
| **Current Conditions Card** | ✅ Complete | Temperature, feels-like, humidity, wind, pressure, visibility, sunrise/sunset |
| **Stat Tiles** | ✅ Complete | Supplementary humidity, wind, pressure, visibility, sunrise, and sunset tiles |
| **Hourly Forecast Strip** | ✅ Complete | Next 24 hours in 3-hour slots (up to 9), icons and rain probability |
| **Forecast Charts** | ✅ Complete | recharts temperature area curve + daily precipitation bars, lazy-loaded |
| **Multi-Day Forecast** | ✅ Complete | 5 days on the free OWM plan; 7 days when One Call 3.0 is available |
| **AI Weather Insights** | ✅ Complete | LLM briefing when an AI key is configured, with a deterministic rule-engine fallback that never fails |
| **Severe-Weather Alerts** | ✅ Complete | Official One Call 3.0 warnings + custom temperature/wind thresholds, alert preview and history |
| **Browser Geolocation** | ✅ Complete | Fresh high-accuracy fix, permission state handling, relaxed retry, accuracy badge |
| **Saved Locations + Auth** | ✅ Complete | Email/password sign-in (bcrypt + JWT), favorites scoped per user |
| **Search History** | ✅ Complete | Last 10 searched cities stored in MongoDB and shown as chips |
| **Dark / Light Mode** | ✅ Complete | Deep-sky dark theme with condition-aware accents + minimalistic light theme |
| **Head Metadata** | ✅ Complete | Per-route title, description, and Open Graph tags |
| **Alert Center** | ✅ Complete | `/alerts` page with saved-location threshold preview and alert history |
| **Documentation & Tests** | ✅ Complete | Technical docs, completion report, deployment guide, and **22 automated tests** (22/22 passing) |
| **Production Readiness** | ✅ Complete | Environment matrix, smoke tests, health checks, and rollback plan finalized — **deployed live on Vercel + Render and verified** |
| **Air Quality Index** | ⏳ Deferred | Planned Week 6 extension; not present in the Week 4 codebase |
| **Offline Detection / Retry with Backoff** | ⏳ Deferred | Future hardening; the current client shows a friendly network error without automatic retry |
| **PWA / Animated Backgrounds** | ⏳ Deferred | Planned optional enhancements for Week 6 |

---

## 🏗️ Project Structure

```
Week5/
├── README.md                        # This file — completion summary and getting-started guide
├── documentation.md                 # Technical documentation of the as-built Project 2
├── project-2-completion-report.md   # Project 2 comprehensive completion report
└── deployment-guide.md              # Production readiness & go-live verification guide

Week4/Weather Application/           # Project 2 source code (implemented in Week 4)
├── backend/                         # Express + Mongoose API
│   ├── package.json                 # express, mongoose, zod, bcryptjs, jsonwebtoken, express-rate-limit
│   ├── README.md                    # Backend API reference
│   ├── src/
│   │   ├── server.js                # Entry point — /api/auth, /api/weather, /api/settings, /health
│   │   ├── config/db.js             # Mongoose connection
│   │   ├── models/                  # User, SearchHistory, FavoriteCity, UserSettings, AlertHistory
│   │   ├── routes/                  # auth.js, weather.js, settings.js
│   │   ├── controllers/             # authController, weatherController, settingsController
│   │   ├── services/                # weatherService, insightsService, alertService
│   │   └── middleware/              # auth, validate, schemas, errorHandler, rateLimiter
│   └── tests/api.test.js            # 22 automated tests (node:test, no live API or DB required)
└── frontend/                        # React + Vite SPA
    ├── package.json                 # react 18, react-router-dom 6, recharts 2, vite 5
    ├── vite.config.js               # Dev proxy: /api & /health → :5000
    ├── index.html                   # SPA entry point
    └── src/
        ├── main.jsx                 # Providers: Theme → Auth → Router
        ├── App.jsx                  # Routes: /, /auth, /alerts
        ├── api.js                   # Centralized API client (auto JWT header)
        ├── index.css                # Dark + light design system
        ├── context/                 # ThemeContext, AuthContext
        ├── hooks/useGeolocation.js  # Geolocation + formatting helpers
        ├── pages/                   # Dashboard, AuthPage, AlertsPage
        └── components/              # Search, weather cards, charts, insights, alerts, favorites, theme
```

---

## ✅ Project 2 — Final Feature Checklist

### Data & Integration
- [x] Server-side OpenWeatherMap proxy (API key never reaches the browser)
- [x] Current conditions, 5-day/3-hour forecast, and geocoding search
- [x] Optional One Call 3.0 upgrade (7-day forecast + official severe-weather alerts)
- [x] Hourly strip (next 24 hours) + multi-day forecast list
- [x] recharts temperature curve + daily precipitation probability chart (lazy-loaded)
- [x] In-memory TTL cache (600 s default) to protect free-tier quota
- [x] Three rate-limiter tiers (weather, insights, auth) and 8 s upstream timeouts

### Intelligence & Alerts
- [x] AI weather briefing (LLM via AI Gateway/OpenAI-compatible endpoint)
- [x] Deterministic rule-engine fallback with a 10-minute LLM cooldown
- [x] Custom per-user temperature and wind thresholds
- [x] Official One Call 3.0 warnings (when the key has access)
- [x] Alert preview across saved locations + deduplicated alert history

### Accounts & Personalization
- [x] Email/password auth (bcrypt + JWT), silent session restore via `GET /api/auth/me`
- [x] Per-user saved locations and alert settings
- [x] Shared search history (last 10 cities) stored in MongoDB
- [x] °C ↔ °F toggle (persisted in `localStorage`)
- [x] Dark / light theme with condition-aware accents

### UI & Quality
- [x] Geolocation on load with permission/accuracy handling
- [x] Loading skeleton, friendly error banner, and empty-state prompts
- [x] Keyboard-navigable search suggestions and ARIA labels on icon-only controls
- [x] Per-route head metadata (title, description, Open Graph)
- [x] **22 automated tests — 22/22 passing**

### Deployment
- [x] Frontend deployed on Vercel — [weather-application-frontend-seven.vercel.app](https://weather-application-frontend-seven.vercel.app/)
- [x] Backend API deployed on Render — [weather-application-s73i.onrender.com](https://weather-application-s73i.onrender.com/)
- [x] MongoDB Atlas connected in production
- [x] CORS `CLIENT_ORIGIN` matches the deployed frontend origin
- [x] `/health` and live weather endpoint verified (`200 OK`, valid JSON)
- [x] Full go-live checklist recorded in [`deployment-guide.md`](deployment-guide.md)

### Deferred to Week 6 / Future Work
- [ ] Air Quality Index endpoint and tile
- [ ] Offline detection and automatic retry with exponential backoff
- [ ] Stale-response guards / request cancellation across dashboard fetches
- [ ] PWA manifest + offline weather caching
- [ ] Animated condition backgrounds

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- OpenWeatherMap API key (free plan is sufficient)

### Installation

Project 2 source lives in `Week4/Weather Application/`.

```bash
git clone https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git
cd ICP-2AA73905-2026-REPO/Week4

# Terminal 1 — backend
cd "Weather Application/backend"
npm install
npm run dev        # → http://localhost:5000

# Terminal 2 — frontend
cd "Weather Application/frontend"
npm install
npm run dev        # → http://localhost:5173
```

### Backend `.env`

Create `Week4/Weather Application/backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/weather_dashboard
WEATHER_API_KEY=your_openweathermap_api_key
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=a_long_random_string
JWT_EXPIRES_IN=7d

# Optional — AI weather briefing (rule engine used when absent)
AI_GATEWAY_API_KEY=
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1
AI_GATEWAY_MODEL=openai/gpt-4o-mini

# Alternative direct OpenAI configuration
# OPENAI_API_KEY=sk-...
# OPENAI_BASE_URL=https://api.openai.com/v1
# OPENAI_MODEL=gpt-4o-mini

# Optional — override the weather API base URL (testing only)
# OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
```

> One Call 3.0 uses the same `WEATHER_API_KEY`. If the key is not subscribed,
> the backend silently falls back to the free 5-day forecast.

### Running Tests

```bash
cd "Weather Application/backend"
npm test
# → 22 tests, 22 pass (node:test — no live API or database required)
```

### Production Build

```bash
cd "Weather Application/frontend"
npm run build
# → dist/ (main bundle + lazy-loaded charts chunk)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router 6, Vite 5, recharts 2 (lazy-loaded), vanilla CSS design system |
| **Backend** | Node.js 18+ (ES Modules), Express 4, Mongoose 8, zod 3, bcryptjs + jsonwebtoken |
| **Database** | MongoDB — `users`, `searchhistories`, `favoritecities`, `usersettings`, `alerthistories` |
| **External APIs** | OpenWeatherMap — Current Weather, 5-day Forecast, Geocoding, One Call 3.0 (optional) |
| **AI Layer** | OpenAI-compatible chat completions (Vercel AI Gateway or OpenAI) + deterministic rule-engine fallback |
| **Resilience** | 8 s upstream timeouts, TTL cache, upstream error mapping, LLM/One Call circuit breakers |
| **Security** | JWT Bearer auth, bcrypt hashing, zod validation, tiered rate limiting, server-side API key |
| **Testing** | Node.js built-in test runner (`node:test`) — 22 tests, 22 pass, zero extra dependencies |
| **Build Tool** | Vite 5 (dev proxy for `/api` + `/health`; production build to `dist/`) |

---

## 📡 API Endpoints

| Method | Route | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | — | Server + DB + weather-key status |
| `POST` | `/api/auth/signup` | — | Register with name, email, password |
| `POST` | `/api/auth/signin` | — | Sign in and receive a JWT |
| `GET` | `/api/auth/me` | ✅ | Current profile from the Bearer token |
| `GET` | `/api/weather/current` | — | Current conditions (city or lat/lon) |
| `GET` | `/api/weather/forecast` | — | Hourly strip + daily forecast |
| `GET` | `/api/weather/search` | — | Geocoding suggestions |
| `GET` | `/api/weather/insights` | — | AI/rule-engine weather briefing |
| `GET` | `/api/weather/history` | — | Recent search history (last 10) |
| `DELETE` | `/api/weather/history` | — | Clear search history |
| `GET` | `/api/weather/favorites` | ✅ | List saved cities for the signed-in user |
| `POST` | `/api/weather/favorites` | ✅ | Save a city |
| `DELETE` | `/api/weather/favorites/:city` | ✅ | Remove a saved city |
| `GET` | `/api/weather/alerts/preview` | ✅ | Live alert check across saved cities |
| `GET` | `/api/weather/alerts/history` | ✅ | Stored alert history for the signed-in user |
| `GET` | `/api/settings` | ✅ | Get per-user alert preferences |
| `PUT` | `/api/settings` | ✅ | Update alert thresholds (temperature + wind) |

---

## 📚 Reference Documentation

| Document | Description |
| :--- | :--- |
| [`documentation.md`](documentation.md) | Technical documentation of the as-built Project 2 |
| [`project-2-completion-report.md`](project-2-completion-report.md) | Project 2 comprehensive completion report |
| [`deployment-guide.md`](deployment-guide.md) | Production readiness & go-live verification |
| [`../Week4/documentation.md`](../Week4/documentation.md) | Project 2 baseline documentation |
| [`../Week3/project-1-completion-report.md`](../Week3/project-1-completion-report.md) | Project 1 completion report (format reference) |

---

## 🔭 Roadmap

| Week | Focus | Deliverables |
| :--- | :--- | :--- |
| **Week 4 (done)** | Project 2 implementation | Weather proxy, auth, geocoding, hourly/daily forecast, charts, AI insights, alerts, favorites, themes, 22 tests |
| **Week 5 (done)** | Project 2 completion | Feature verification, completion report, technical documentation, deployment readiness guide, and **live deployment (Vercel + Render)** |
| **Week 6** | Release hardening + next project | Optional AQI / offline handling / PWA enhancements and **Project 3** kickoff for strong students |

---

## 📬 Contact & Support

- **Repository:** [ICP-2AA73905-2026-REPO](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
- **Portal ID:** `ICP-2AA73905-2026`
- **Internship Track:** Web Development Self-Learning Program
- **Module:** Week 5 — Project 2 Completion (Verification, Documentation & Deployment Readiness)
