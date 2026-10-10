# Weather Dashboard — Frontend (React + Vite)

Client for **Project 2: Weather Dashboard Application** (Week 4). Talks **only** to the Week 4 Express backend — the OpenWeatherMap key never reaches the browser.

## Stack
- React 18 + Vite 6
- React Router 6 (`/` dashboard, `/auth` sign-in)
- recharts for temperature + precipitation charts (lazy-loaded chunk)
- Vanilla CSS design system — dark deep-sky theme (condition-aware accents) + minimalistic light theme
- `fetch` API via centralized `src/api.js` client (auto `Authorization: Bearer` header)

## Quick Start
```bash
npm install
npm run dev     # http://localhost:5173  (proxies /api → :5000)
npm run build   # production bundle → dist/ (~60 kB gz main + charts chunk)
```

> Start the backend first (`Week4/Weather Application/backend` → `npm run dev`) so `/api` resolves.

## Structure

```
src/
├── main.jsx            # Providers: ThemeProvider → AuthProvider → BrowserRouter
├── App.jsx             # Routes: "/" Dashboard, "/auth" AuthPage, "*" → "/"
├── api.js              # Data Access Layer — all HTTP calls + JWT header
├── index.css           # Design system (tokens, components, responsive, themes)
├── context/
│   ├── ThemeContext.jsx # dark/light → documentElement.dataset.theme (localStorage)
│   └── AuthContext.jsx  # session restore, signup/signin/logout
├── hooks/useGeolocation.js  # Geolocation hook + °C/°F, date, icon helpers
├── pages/
│   ├── Dashboard.jsx    # Orchestration: fetch flows, favorites, meta, accents
│   └── AuthPage.jsx     # Sign in / sign up form
└── components/
```

## Component Map

| Component | Responsibility |
| :--- | :--- |
| `pages/Dashboard.jsx` | State orchestration, fetch flows, unit toggle, favorites/history, route meta, condition accents |
| `pages/AuthPage.jsx` | Email/password sign-in and sign-up with inline errors |
| `SearchForm.jsx` | Debounced geocoding suggestions (↑↓ + Enter), recent-search chips, clear history |
| `CurrentWeatherCard.jsx` | Full-bleed hero — big temp, condition, feels-like + H/L, large condition icon, ★ favorite |
| `StatTiles.jsx` | 2 × 3 stat tiles beside the hero — humidity, wind, pressure, visibility, sunrise, sunset |
| `HourlyStrip.jsx` | Next-24h horizontal strip (3-hour intervals, icons, rain %) |
| `ForecastCharts.jsx` | Two side-by-side cards: recharts temperature curve + daily precipitation bars (code-split) |
| `ForecastList.jsx` | Full-width multi-day rows with min — range bar — max (5 days free / 7 with One Call 3.0) |
| `GeolocationBadge.jsx` | "Use my location" button + permission status + device accuracy badge (warns on coarse >10 km fixes) |
| `FavoritesBar.jsx` | Saved locations quick-switcher (auth-aware sign-in prompt) |
| `ThemeToggle.jsx` | Sun/moon dark ↔ light switch |
| `hooks/useGeolocation.js` | Browser Geolocation hook + °C/°F and date helpers |
| `api.js` | Data Access Layer — single place for all HTTP calls |

## State Held in `pages/Dashboard.jsx`
```
weather    — CurrentWeather view model (backend-normalized)
forecast   — { city, country, source, hourly[~8], days[5|7] }
history    — last 10 searched cities (MongoDB, public)
favorites  — starred cities (MongoDB, per-user — requires sign-in)
unit       — 'C' | 'F' (persisted in localStorage)
loading / error / geo — UI states
```

Theme lives in `ThemeContext` (`dark` | `light`, persisted), session in `AuthContext` (JWT in localStorage, restored via `GET /api/auth/me`).
