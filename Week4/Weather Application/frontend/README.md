# Weather Dashboard — Frontend (React + Vite)

Client for **Project 2: Weather Dashboard Application** (Week 4). Talks **only** to the Week 4 Express backend — the OpenWeatherMap key never reaches the browser.

## Stack
- React 18 + Vite 6
- Vanilla CSS with design tokens (no UI framework)
- `fetch` API via centralized `src/api.js` client

## Quick Start
```bash
npm install
npm run dev     # http://localhost:5173  (proxies /api → :5000)
npm run build   # production bundle → dist/
```

> Start the backend first (`Week4/Weather Application/backend` → `npm run dev`) so `/api` resolves.

## Component Map

| Component | Responsibility |
| :--- | :--- |
| `App.jsx` | State orchestration, fetch flows, unit toggle, favorites/history actions |
| `SearchForm.jsx` | City input, recent-search chips, clear history |
| `CurrentWeatherCard.jsx` | Hero card — temp, condition, humidity, wind, pressure, visibility, ★ favorite |
| `FiveDayForecast.jsx` | 5-column daily forecast grid (min/max, humidity, rain %) |
| `GeolocationBadge.jsx` | "Use my location" button + permission status |
| `FavoritesBar.jsx` | Starred cities quick-switcher |
| `hooks/useGeolocation.js` | Browser Geolocation hook + °C/°F and date helpers |
| `api.js` | Data Access Layer — single place for all HTTP calls |

## State Held in `App.jsx`
```
weather    — CurrentWeather view model (backend-normalized)
forecast   — { city, country, days[5] }
history    — last 10 searched cities (MongoDB)
favorites  — starred cities (MongoDB)
unit       — 'C' | 'F' (persisted in localStorage)
loading / error / geo — UI states
```
