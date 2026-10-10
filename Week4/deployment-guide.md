# Week 4: Production Deployment & Live Hosting Guide — Weather Dashboard

**Internship Portal ID:** `ICP-2AA73905-2026`
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
**Project:** Weather Dashboard (MERN + OpenWeatherMap API)

---

## 1. Production Architecture Overview

```
+---------------------------+         +-------------------------------+
|     Vercel / Netlify      |         |        Render / Railway       |
|   Frontend (React/Vite)   | <-----> |      Backend REST API         |
|  weatherdash.vercel.app   |  HTTPS  |  weatherdash-api.onrender.com |
+---------------------------+         +-------------------------------+
                                                      |
                                                      | HTTPS (server-side only)
                                                      v
                                        +--------------------------------------+
                                        |     OpenWeatherMap REST API          |
                                        |  (API key stored in backend .env)    |
                                        +--------------------------------------+

+---------------------------+
|       MongoDB Atlas       |
|  Search history +         |
|  favorite cities          |
+---------------------------+
```

**Key principle:** The OpenWeatherMap API key NEVER appears in the frontend bundle — the React app only talks to our Express API.

---

## 2. Environment Variables Matrix

### Backend `.env`

| Variable | Required | Example / Production Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5000` (or provider-assigned) | HTTP port |
| `NODE_ENV` | Yes | `production` | Enables production hardening |
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster0.mongodb.net/weather_dashboard` | Database connection |
| `WEATHER_API_KEY` | Yes | `a1b2c3d4e5f6...` | OpenWeatherMap key (server-side only) |
| `CLIENT_ORIGIN` | Yes | `https://weatherdash.vercel.app` | Allowed CORS origin |
| `JWT_SECRET` | Yes | `a-very-long-random-hex-string` | JWT signing key for saved-location auth |
| `JWT_EXPIRES_IN` | No | `7d` | Access token lifespan |
| `OPENWEATHER_BASE_URL` | No | `https://api.openweathermap.org/data/2.5` | Override for testing |
| `CACHE_TTL_SECONDS` | No | `600` | In-memory cache TTL for weather responses |
| `OPENAI_API_KEY` | No | `sk-...` | Enables LLM-generated weather insights (rule engine is used when empty) |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Chat model for insights (OpenAI-compatible endpoints supported via `OPENAI_BASE_URL`) |

### Frontend `.env`

| Variable | Required | Example | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | `https://weatherdash-api.onrender.com` | Backend API base URL (empty in dev = use Vite proxy) |

---

## 3. Step-by-Step Deployment

### Part A: MongoDB Atlas

1. Create a free M0 cluster at <https://www.mongodb.com/cloud/atlas>.
2. Create a database user with Read/Write access to `weather_dashboard`.
3. Network Access → add `0.0.0.0/0` (or your hosting provider's IP range).
4. Copy the SRV connection string into `MONGODB_URI`.

### Part B: Backend on Render

1. Connect the GitHub repo → **New → Web Service**.
2. **Root Directory:** `Week4/Weather Application/backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add environment variables from the matrix above.
6. Deploy → note your URL, e.g. `https://weatherdash-api.onrender.com`.
7. Verify: `GET https://weatherdash-api.onrender.com/health` →
   ```json
   { "ok": true, "services": { "database": "connected", "weatherApi": "configured" } }
   ```

### Part C: Frontend on Vercel

1. Import the repo → **Root Directory:** `Week4/Weather Application/frontend`.
2. **Framework Preset:** Vite → **Build:** `npm run build` → **Output:** `dist`.
3. Add `VITE_API_BASE_URL` = your Render backend URL.
4. Deploy → note the URL, e.g. `https://weatherdash.vercel.app`.
5. **Round-trip:** Update the backend's `CLIENT_ORIGIN` to the Vercel URL and redeploy the backend.

> **SPA rewrite:** Vite apps on Vercel work out of the box; if you add client-side routing later, add `vercel.json`:
> ```json
> { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
> ```

---

## 4. Post-Deployment Verification

1. **Health check:** `GET /health` → `200`, database `connected`.
2. **Current weather:** open the live site → search `Pune` → card renders.
3. **Geolocation:** click "Use my location" → allow → location weather loads.
4. **History:** search 2 cities → refresh → history chips persist (MongoDB).
5. **Favorites:** star a city → reload → still present.
6. **Error path:** search `Zzzzznotacity` → friendly "City not found" message (no crash).

---

## 5. Troubleshooting

| Symptom | Likely Cause | Fix |
| :--- | :--- | :--- |
| `CORS error` in browser console | Backend `CLIENT_ORIGIN` mismatch | Set to exact Vercel URL (no trailing slash), redeploy |
| `401 Unauthorized` from weather API | Missing/expired `WEATHER_API_KEY` | Regenerate key (may take 2h to activate), update env |
| `429 Too Many Requests` | Free-tier rate limit hit | Raise `CACHE_TTL_SECONDS`, wait for quota reset |
| Blank data, `/health` shows DB `disconnected` | Atlas IP allowlist | Add `0.0.0.0/0` under Network Access |
| Frontend hits `localhost:5000` in prod | `VITE_API_BASE_URL` unset | Set env var in Vercel and rebuild |
