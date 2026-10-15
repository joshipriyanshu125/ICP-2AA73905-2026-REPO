# Week 4: Weather Dashboard Application

## Intern Career Path — Web Development
**Portal ID:** `ICP-2AA73905-2026`  
**Repository:** ICP-2AA73905-2026-REPO  
**Internship Week:** Week 4  
**Project:** Weather Dashboard Application (Project 2)

---

## 📋 Overview

Week 4 focuses on **external API integration**, **asynchronous data fetching**, and **data visualization** using the **MERN stack**. Building on the core patterns from Week 2 (Task Management Application), this week transitions from local state management to real-world external HTTP data handling via the OpenWeatherMap API.

The Weather Dashboard Application provides real-time weather conditions, hourly and multi-day forecasts, AI-powered insights, configurable severe-weather alerts, and saved favorite locations with per-user authentication.

---

## 🎯 Objectives & Deliverables

| Target Task | Status | Implementation Details |
| :--- | :---: | :--- |
| **OpenWeatherMap API Integration** | ✅ Complete | Server-side proxy for current weather + 5-day forecast; API key never reaches the browser |
| **City Search with Geocoding** | ✅ Complete | Search-as-you-type suggestions via OWM Geocoding API (debounced, keyboard-navigable) |
| **Current Conditions Card** | ✅ Complete | Large display temperature, feels-like, humidity, wind, pressure, visibility, sunrise/sunset |
| **Stat Tiles** | ✅ Complete | Supplementary metric tiles (humidity, pressure, visibility, wind) via `StatTiles.jsx` |
| **Hourly Forecast Strip** | ✅ Complete | Next 24 hours (3-hour intervals, up to 9 slots) with icons and rain probability |
| **Forecast Charts** | ✅ Complete | Temperature curve (area) + daily precipitation probability (bars) via recharts (lazy-loaded) |
| **Multi-Day Forecast** | ✅ Complete | Daily list — 5 days on free OWM plan, auto-upgrades to 7 days with One Call 3.0 |
| **AI Weather Insights** | ✅ Complete | `WeatherInsights.jsx` — 3 actionable tips via LLM (`OPENAI_API_KEY` or `AI_GATEWAY_API_KEY`); deterministic rule-engine fallback (never fails) |
| **Severe-Weather Alerts** | ✅ Complete | `AlertBanner.jsx` on dashboard + dedicated `/alerts` page + `AlertSettings.jsx` modal — official One Call 3.0 warnings and custom temp/wind thresholds; history stored in `AlertHistory` collection |
| **Browser Geolocation** | ✅ Complete | Auto-locate on load, permission state handling, accuracy warning for coarse positions, graceful fallback to manual search |
| **Saved Locations + Auth** | ✅ Complete | Email/password sign-in (JWT + bcrypt), favorites scoped per-user in MongoDB |
| **Dark / Light Mode** | ✅ Complete | Deep-sky dark theme with condition-aware accents + minimalistic light theme via `ThemeToggle.jsx` |
| **Head Metadata** | ✅ Complete | Per-route title/description/og tags (dashboard + auth + alerts) |
| **Alert History Page** | ✅ Complete | Dedicated `/alerts` route (`AlertsPage.jsx`) showing past threshold + official warnings per user |
| **Documentation & Tests** | ✅ Complete | Full technical docs, deployment guide, **22 automated tests** passing (Node.js built-in test runner) |

---

## 🏗️ Project Structure

```
Week4/
├── README.md                 # This file — week summary and getting-started guide
├── documentation.md          # Full technical documentation
├── deployment-guide.md       # Deployment instructions (Vercel + Render)
├── .gitignore                # Git ignore rules
└── Weather Application/      # Project 2 root
    ├── backend/              # MERN Backend
    │   ├── package.json      # express, mongoose, zod, bcryptjs, jsonwebtoken, express-rate-limit
    │   ├── .env              # PORT, MONGODB_URI, WEATHER_API_KEY, JWT_SECRET, OPENAI_API_KEY
    │   ├── README.md         # Backend API reference
    │   ├── src/
    │   │   ├── server.js             # Entry point — /api/auth, /api/weather, /api/settings, /health
    │   │   ├── config/db.js          # Mongoose connection
    │   │   ├── models/               # User, SearchHistory, FavoriteCity, UserSettings, AlertHistory
    │   │   ├── routes/               # auth.js, weather.js, settings.js
    │   │   ├── controllers/          # authController, weatherController, settingsController
    │   │   ├── services/             # weatherService (OWM + One Call 3.0), insightsService (LLM/rule-engine), alertService (threshold evaluator)
    │   │   └── middleware/           # auth (JWT), validate (zod), schemas, errorHandler, rateLimiter (3 tiers)
    │   └── tests/api.test.js         # 22 automated tests (node:test, zero extra deps)
    └── frontend/             # React + Vite Frontend
        ├── package.json      # react 18, react-router-dom 6, recharts 2
        ├── vite.config.js    # Vite 5 + /api & /health dev proxy to :5000
        ├── index.html        # HTML template + og/meta tags
        ├── README.md         # Frontend component map
        ├── public/favicon.svg
        └── src/
            ├── main.jsx              # Providers: Theme → Auth → Router
            ├── App.jsx               # Routes: / (dashboard), /auth, /alerts
            ├── api.js                # Centralized API client (auto JWT header)
            ├── index.css             # Design system: dark (deep-sky) + light (minimal)
            ├── context/              # ThemeContext, AuthContext
            ├── hooks/useGeolocation.js  # Geolocation hook + formatting helpers
            ├── pages/                # Dashboard.jsx, AuthPage.jsx, AlertsPage.jsx
            └── components/
                ├── SearchForm.jsx         # Geocoding suggestions + search history chips
                ├── CurrentWeatherCard.jsx # Hero: big temp, stats, sunrise/sunset, ★ favorite
                ├── StatTiles.jsx          # Supplementary metric tiles (humidity, pressure, etc.)
                ├── HourlyStrip.jsx        # Next-24h horizontal strip (up to 9 slots)
                ├── ForecastCharts.jsx     # recharts temperature area + precipitation bars (lazy-loaded)
                ├── ForecastList.jsx       # Multi-day forecast rows (5–7 days)
                ├── WeatherInsights.jsx    # AI/rule-engine insights panel (3 tips)
                ├── AlertBanner.jsx        # Inline alert banner on the dashboard
                ├── AlertSettings.jsx      # Per-user alert threshold modal (temp + wind)
                ├── FavoritesBar.jsx       # Saved locations bar (auth-aware)
                ├── GeolocationBadge.jsx   # Location button + permission state display
                └── ThemeToggle.jsx        # Sun/moon dark-light switch
```

---

## 🆕 Key Concepts Implemented This Week

### 1. External REST API Integration
- Fetching data from third-party services (OpenWeatherMap)
- Server-side API key management — key is never exposed to the browser
- In-memory TTL cache (600 s default) to protect free-tier quota
- Graceful upstream error mapping (404 → city not found, 401 → bad key, 429 → rate limited)

### 2. Asynchronous JavaScript
- `async`/`await` pattern throughout the backend service layer
- `AbortSignal.timeout(8000)` on every external fetch to prevent hangs
- Loading and error states in UI components

### 3. Browser Geolocation API
- `useGeolocation` hook with permission state machine (idle → requesting → granted/denied/unavailable)
- Accuracy warning when the browser reports a coarse position
- Graceful fallback to manual city search when location is denied

### 4. Data Visualization
- **recharts** area chart for temperature trends
- recharts bar chart for daily precipitation probability
- Charts are code-split (lazy-loaded) to keep the main bundle small

### 5. One Call 3.0 Progressive Enhancement
- Backend attempts One Call 3.0 first for a 7-day daily forecast + official severe-weather alerts
- Falls back silently to the free 5-day/3-hour endpoint after the first 401/403 (circuit breaker)

### 6. AI Weather Insights with Rule-Engine Fallback
- `insightsService.js` calls an OpenAI-compatible `/chat/completions` endpoint
- Supports both `OPENAI_API_KEY` (direct) and `AI_GATEWAY_API_KEY` (Vercel AI Gateway)
- After 3 consecutive LLM failures the service enters a 10-minute cooldown and serves rule-engine insights; the endpoint **never fails** because of the AI layer

### 7. Configurable Severe-Weather Alerts
- Custom temperature and wind-speed thresholds stored per user in `UserSettings`
- `alertService.js` evaluates current conditions and the forecast against user thresholds
- Alert history deduplicated by fingerprint (`city|type|date`) and stored in `AlertHistory`

---

## 📚 Reference Documentation

| Document | Description |
| :--- | :--- |
| [`documentation.md`](documentation.md) | Full technical documentation for this project |
| [`deployment-guide.md`](deployment-guide.md) | Deployment instructions (Vercel + Render) |
| [`Week2/documentation.md`](../Week2/documentation.md) | Task Management Application — core architectural patterns |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- OpenWeatherMap API key (free plan is sufficient)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git
cd ICP-2AA73905-2026-REPO/Week4
```

#### 2. Backend Setup

```bash
cd "Weather Application/backend"
npm install

# Create your .env — minimum required variables:
# PORT=5000
# MONGODB_URI=mongodb+srv://... or mongodb://127.0.0.1:27017/weather_dashboard
# WEATHER_API_KEY=your_openweathermap_api_key
# CLIENT_ORIGIN=http://localhost:5173
# JWT_SECRET=a_long_random_string
# JWT_EXPIRES_IN=7d
#
# Optional — AI weather insights (rule engine used when absent):
# OPENAI_API_KEY=sk-...
# AI_GATEWAY_API_KEY=...        # Vercel AI Gateway
# AI_GATEWAY_BASE_URL=...
# AI_GATEWAY_MODEL=openai/gpt-4o-mini
#
# Optional — One Call 3.0 (7-day forecast + official alerts, requires OWM subscription):
# Uses the same WEATHER_API_KEY; gracefully skips if 401/403

npm run dev
# → Weather API listening on http://localhost:5000
```

#### 3. Frontend Setup

```bash
cd "Weather Application/frontend"
npm install
npm run dev
# → Local: http://localhost:5173
```

#### 4. Running Both Together

```bash
# Terminal 1
cd "Weather Application/backend" && npm run dev

# Terminal 2
cd "Weather Application/frontend" && npm run dev

# Open http://localhost:5173
```

#### 5. Running Tests

```bash
cd "Weather Application/backend"
npm test
# → 22 tests, 22 pass (node:test — no live API or DB required)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router 6, Vite 5, recharts 2 (lazy-loaded), vanilla CSS design system (CSS custom properties) |
| **Backend** | Node.js 18+ (ES Modules), Express 4, Mongoose 8, zod 3 (validation), bcryptjs + jsonwebtoken (auth) |
| **Database** | MongoDB (Atlas or local) — `users`, `searchhistories`, `favoritecities`, `usersettings`, `alerthistories` collections |
| **External APIs** | OpenWeatherMap — Current Weather (`/data/2.5/weather`), 5-day Forecast (`/data/2.5/forecast`), Geocoding (`/geo/1.0/direct`), One Call 3.0 optional |
| **AI Layer** | OpenAI-compatible chat-completions (`OPENAI_API_KEY` or Vercel AI Gateway); deterministic rule-engine fallback |
| **Security** | JWT Bearer auth, bcrypt password hashing, zod input validation, 3-tier rate limiting (weather / insights / auth), server-side API key proxy |
| **UX / Theme** | Dark deep-sky theme with condition-aware accents, minimalistic light theme, localStorage persistence, per-route meta/og tags |
| **Build Tool** | Vite 5 (dev proxy for `/api` + `/health`; production build to `dist/`) |
| **Testing** | Node.js built-in test runner (`node:test`) — 22 tests, 22 pass, zero extra dependencies |
| **Environment** | dotenv for secure environment variable management |

---

## 📡 API Endpoints

| Method | Route | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | — | Server + DB status check |
| `POST` | `/api/auth/signup` | — | Register with name, email, password |
| `POST` | `/api/auth/login` | — | Sign in, receive JWT |
| `GET` | `/api/weather/current` | — | Current conditions (city or lat/lon) |
| `GET` | `/api/weather/forecast` | — | Hourly strip + daily forecast (city or lat/lon) |
| `GET` | `/api/weather/search` | — | Geocoding suggestions |
| `GET` | `/api/weather/insights` | — | AI/rule-engine insights for a location |
| `GET` | `/api/weather/history` | — | Recent search history (browser-scoped) |
| `DELETE` | `/api/weather/history` | — | Clear search history |
| `GET` | `/api/weather/favorites` | ✅ | List saved cities for the signed-in user |
| `POST` | `/api/weather/favorites` | ✅ | Save a city |
| `DELETE` | `/api/weather/favorites/:city` | ✅ | Remove a saved city |
| `GET` | `/api/weather/alerts/preview` | ✅ | Live alert check across all saved cities |
| `GET` | `/api/weather/alerts/history` | ✅ | Stored alert history for the signed-in user |
| `GET` | `/api/settings` | ✅ | Get per-user alert preferences |
| `PUT` | `/api/settings` | ✅ | Update alert thresholds (temp + wind) |

---

## 📬 Contact & Support

- **Repository:** [ICP-2AA73905-2026-REPO](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
- **Portal ID:** `ICP-2AA73905-2026`
- **Internship Track:** Web Development Self-Learning Program
- **Module:** Week 4 — External API Integration & Data Visualization

