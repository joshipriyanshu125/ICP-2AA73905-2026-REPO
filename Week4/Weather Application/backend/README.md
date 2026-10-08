# Weather Dashboard — Backend (Express + Mongoose)

MERN backend for **Project 2: Weather Dashboard Application**. Proxies the OpenWeatherMap API (keeping the key server-side) and persists search history + favorite cities in MongoDB.

## Stack
- Node.js (ES Modules) + Express 5-compatible API
- Mongoose ODM → MongoDB (`weather_dashboard`)
- `express-rate-limit` for per-IP protection
- Node.js built-in test runner

## Quick Start
```bash
cp .env.example .env    # add your WEATHER_API_KEY + MONGODB_URI
npm install
npm run dev             # http://localhost:5000
npm test                # run integration tests
```

## Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/health` | Server + DB + API-key status |
| GET | `/api/weather/current?city=Pune` | Current weather by city |
| GET | `/api/weather/current?lat=..&lon=..` | Current weather by coordinates |
| GET | `/api/weather/forecast?city=Pune` | 5-day forecast (city) |
| GET | `/api/weather/forecast?lat=..&lon=..` | 5-day forecast (coordinates) |
| GET | `/api/weather/history` | Last 10 searched cities |
| DELETE | `/api/weather/history` | Clear history |
| GET | `/api/weather/favorites` | List favorites |
| POST | `/api/weather/favorites` | Add favorite `{ city, country, coords }` |
| DELETE | `/api/weather/favorites/:city` | Remove favorite |

## Layered Architecture
```
routes/weather.js → controllers/weatherController.js → services/weatherService.js → OpenWeatherMap
                                                     → models/ (SearchHistory, FavoriteCity) → MongoDB
```
