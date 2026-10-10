# Week 4: Weather Dashboard Application

## Intern Career Path — Web Development
**Portal ID:** `ICP-2AA73905-2026`  
**Repository:** ICP-2AA73905-2026-REPO  
**Internship Week:** Week 4  
**Project:** Weather Dashboard Application (Project 2)

---

## 📋 Overview

Week 4 focuses on **external API integration**, **asynchronous data fetching**, and **data visualization** using the **MERN stack**. Building on the core functionality from Week 2 (Task Management Application), this week transitions from local state management to real-world external HTTP data handling via the OpenWeatherMap API.

The Weather Dashboard Application provides users with quick access to real-time weather forecasts and visual climate data for daily planning.

---

## 🎯 Objectives & Deliverables

| Target Task | Status | Implementation Details |
| :--- | :---: | :--- |
| **OpenWeatherMap API Integration** | ✅ Complete | Server-side proxy for current weather + forecast; API key never reaches the browser |
| **City Search with Geocoding** | ✅ Complete | Search-as-you-type suggestions via OWM Geocoding API (debounced, keyboard-navigable) |
| **Current Conditions Card** | ✅ Complete | Large display temperature, feels-like, humidity, wind, pressure, visibility, sunrise/sunset |
| **Hourly Forecast Strip** | ✅ Complete | Next 24 hours (3-hour intervals) with icons and rain probability |
| **Forecast Charts** | ✅ Complete | Temperature curve (area) + daily precipitation probability (bars) via recharts |
| **Multi-Day Forecast** | ✅ Complete | Daily list — 5 days free plan, auto-upgrades to 7 days with One Call 3.0 |
| **AI Weather Insights** | ✅ Complete | 3 brief, actionable recommendations above the hourly strip — LLM via optional `OPENAI_API_KEY`, rule-engine fallback otherwise (never fails) |
| **Severe-Weather Alerts** | ✅ Complete | Alert banner (official One Call 3.0 warnings + custom temp/wind thresholds) with a per-user Alert Settings modal |
| **Browser Geolocation** | ✅ Complete | Real-time auto-locate on load (fresh high-accuracy fix, no dummy default city), permission states, accuracy warning for coarse positions, graceful fallback to manual search |
| **Saved Locations + Auth** | ✅ Complete | Email/password sign-in (JWT + bcrypt), favorites scoped per-user in MongoDB |
| **Dark / Light Mode** | ✅ Complete | Deep-sky dark theme with condition-aware accents + minimalistic light theme |
| **Head Metadata** | ✅ Complete | Per-route title/description/og tags (dashboard + auth) |
| **Documentation & Deployment** | ✅ Complete | Full technical docs, deployment guide, 20/20 automated tests passing |

---

## 🏗️ Project Structure

```
Week4/
├── README.md                 # Week 4 syllabus, focus areas, and milestone summary
├── documentation.md          # Full technical documentation
├── deployment-guide.md       # Deployment instructions (Vercel + Render)
├── .gitignore                # Git ignore rules
└── Weather Application/      # Project 2 root (mirrors Week2/Task Management)
    ├── backend/              # MERN Backend Implementation
    │   ├── package.json      # express, mongoose, zod, bcryptjs, jsonwebtoken
    │   ├── .env / .env.example  # PORT, MONGODB_URI, WEATHER_API_KEY, JWT_SECRET
    │   ├── README.md         # Backend API reference
    │   ├── src/
    │   │   ├── server.js             # Entry point — mounts /api/auth, /api/weather, /api/settings
    │   │   ├── config/db.js          # Mongoose connection
    │   │   ├── models/               # User, SearchHistory, FavoriteCity, UserSettings
    │   │   ├── routes/               # auth.js, weather.js, settings.js
    │   │   ├── controllers/          # authController, weatherController, settingsController
    │   │   ├── services/             # weatherService (OWM client + One Call alerts), insightsService (LLM/rules)
    │   │   └── middleware/           # auth (JWT), validate (zod), schemas, errorHandler, rateLimiter
    │   └── tests/api.test.js         # 20 automated tests (node:test)
    └── frontend/             # React + Vite Frontend
        ├── package.json      # react, react-router-dom, recharts
        ├── vite.config.js    # Vite build config + /api dev proxy
        ├── index.html        # HTML template + og/meta tags
        ├── README.md         # Frontend component map
        ├── public/favicon.svg
        └── src/
            ├── main.jsx              # Providers: Theme → Auth → Router
            ├── App.jsx               # Routes: / (dashboard), /auth
            ├── api.js                # Centralized API client (auto JWT header)
            ├── index.css             # Design system: dark (deep-sky) + light (minimal)
            ├── context/              # ThemeContext, AuthContext
            ├── hooks/useGeolocation.js  # Geolocation + formatting helpers
            ├── pages/                # Dashboard.jsx, AuthPage.jsx
            └── components/
                ├── SearchForm.jsx         # Geocoding suggestions + history chips
                ├── CurrentWeatherCard.jsx # Hero: big temp, stats, sunrise/sunset, ★
                ├── HourlyStrip.jsx        # Next-24h horizontal strip
                ├── ForecastCharts.jsx     # recharts temperature + precipitation
                ├── ForecastList.jsx       # Multi-day forecast rows
                ├── FavoritesBar.jsx       # Saved locations (auth-aware)
                ├── GeolocationBadge.jsx   # Location button + permission states
                └── ThemeToggle.jsx        # Sun/moon dark-light switch
```

---

## 🆕 New This Week: Key Concepts

### 1. External REST API Integration
- Fetching data from third-party services (OpenWeatherMap)
- API key management and security
- Rate limiting and error handling
- JSON parsing and data transformation

### 2. Asynchronous JavaScript
- `async`/`await` pattern for network requests
- Error boundaries for failed API calls
- Loading and error states in UI

### 3. Browser Geolocation API
- Accessing user's current location with permission
- Fallback when location services are disabled
- Combining geolocation with city search

### 4. Data Visualization
- Displaying multi-day forecast data
- Temperature unit toggles (Celsius/Fahrenheit)
- Weather condition icons and descriptions

### 5. LocalStorage Persistence
- Caching recent city searches
- Preserving user preferences between sessions
- Offline state management

---

## 📚 Reference Documentation

| Document | Description | Reference |
| :--- | :--- | :--- |
| [`Week2/documentation.md`](../Week2/documentation.md) | Week 2 core functionality and architectural patterns | Task Management Application |
| [`Week2/backend-architecture.md`](../Week2/backend-architecture.md) | Modular monolith architecture and API design | Task Management Backend |
| [`Week3/documentation.md`](../Week3/documentation.md) | Full technical journal and event pipeline architecture | TaskFlow Project |
| [`Week3/deployment-guide.md`](../Week3/deployment-guide.md) | Production deployment guide (Vercel/Render/Railway) | TaskFlow Deployment |
| [`Week1/project-selection.md`](../Week1/project-selection.md) | Original project selection rationale and milestones | Week 1 Planning |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarn.dev/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- OpenWeatherMap API key

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git
cd ICP-2AA73905-2026-REPO/Week4
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd "Weather Application/backend"

# Install NPM dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and fill in your values
cp .env.example .env

# Your .env should contain:
# PORT=5000
# MONGODB_URI=mongodb+srv://... or mongodb://127.0.0.1:27017/weather_dashboard
# WEATHER_API_KEY=your_openweathermap_api_key
# CLIENT_ORIGIN=http://localhost:5173
# JWT_SECRET=a_long_random_string_for_auth_tokens
# JWT_EXPIRES_IN=7d
# OPENAI_API_KEY=          # optional — LLM weather insights (rule engine when empty)

# Launch development server
npm run dev

# Server outputs: Weather API listening on http://localhost:5000
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd "Weather Application/frontend"

# Install NPM dependencies
npm install

# Launch development server
npm run dev

# Vite outputs: Local: http://localhost:5173
```

#### 4. Full Application

```bash
# From the Week4 root directory, start both servers
# Terminal 1:
cd "Weather Application/backend" && npm run dev

# Terminal 2:
cd "Weather Application/frontend" && npm run dev

# Open your browser at http://localhost:5173
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router 6, Vite 6, recharts (code-split), vanilla CSS design system (CSS custom properties) |
| **Backend** | Node.js (ES Modules), Express 4, Mongoose ODM, zod (validation), bcryptjs + jsonwebtoken (auth) |
| **Database** | MongoDB (Atlas or local) — `users`, `searchhistories`, `favoritecities` collections |
| **External APIs** | OpenWeatherMap — Current Weather, 5-day/3-hour Forecast, Geocoding, One Call 3.0 (optional) |
| **Security** | JWT Bearer auth, bcrypt hashing, zod input validation, rate limiting (api/weather/auth tiers), server-side API key |
| **UX / Theme** | Dark deep-sky theme with condition-aware accents, minimalistic light theme, localStorage persistence, per-route meta tags |
| **Build Tool** | Vite 6 (main bundle ~60 kB gz, charts lazy-loaded) |
| **Testing** | Node.js built-in test runner — 14 tests, 100% pass rate |
| **Environment** | dotenv for secure environment variable management |

---

## 📅 Week 4 Milestone Roadmap

| Week | Focus | Key Deliverables |
| :--- | :--- | :--- |
| **Week 4** | **API Integration & Core UI** | OpenWeatherMap API integration, current weather card, city search, basic forecast |
| **Week 5** | **Geolocation & Forecast Enhancement** | Browser geolocation, 5-day forecast display, error handling, resilience patterns |
| **Week 6** | **Charts & Production Release** | Chart.js temperature trends, Celsius/Fahrenheit toggle, favorite cities storage, deployment |

---

## 📬 Contact & Support

- **Repository:** [ICP-2AA73905-2026-REPO](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
- **Portal ID:** `ICP-2AA73905-2026`
- **Internship Track:** Web Development Self-Learning Program
- **Module:** Week 4 — External API Integration & Data Visualization

