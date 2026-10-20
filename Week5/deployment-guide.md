# Week 5: Production Readiness & Live Deployment Guide — Weather Dashboard (Project 2)

**Internship Portal ID:** `ICP-2AA73905-2026`
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
**Project:** Weather Dashboard (MERN + OpenWeatherMap API)
**Status:** ✅ **Live** — deployed on Vercel + Render (verified 20 October 2026)

> This guide finalizes the deployment plan drafted in [`Week4/deployment-guide.md`](../Week4/deployment-guide.md) after Project 2 reached feature completion. It reflects the code actually present in `Week4/Weather Application/` — endpoints, environment variables, test count, and the verified live production deployment.

---

## 1. Production Architecture

```text
+--------------------------------------------------------------+
|                Vercel — Frontend (React/Vite)                |
|      weather-application-frontend-seven.vercel.app           |
+------------------------------+-------------------------------+
                               | HTTPS
+------------------------------v-------------------------------+
|                Render — Backend REST API                     |
|           weather-application-s73i.onrender.com              |
+------------------------------+-------------------------------+
                               | HTTPS (server-side only)
                               v
                 +--------------------------------------+
                 |     OpenWeatherMap REST API          |
                 |  (API key stored in backend env)     |
                 +--------------------------------------+
                               |
                               | optional
                               v
                 +--------------------------------------+
                 |   AI Gateway / OpenAI-compatible     |
                 |   chat completions (optional)        |
                 +--------------------------------------+

+---------------------------+
|       MongoDB Atlas       |
| users, search histories,  |
| favorites, settings,      |
| alert history             |
+---------------------------+
```

**Key principles**

1. The OpenWeatherMap API key **never** appears in the frontend bundle — the React app only talks to our Express API.
2. The LLM key (`AI_GATEWAY_API_KEY` / `OPENAI_API_KEY`) stays server-side; the deterministic rule engine keeps the app fully functional without it.
3. Frontend and backend are deployed independently; only `CLIENT_ORIGIN` couples them (CORS).

---

## 2. Pre-Flight Checklist (Week 5 Sign-Off)

### Code & Quality
- [x] All implemented Project 2 features verified (see [`project-2-completion-report.md`](project-2-completion-report.md))
- [x] 22 automated tests passing locally (`npm test` → 22/22)
- [x] Production build succeeds (`npm run build` → `dist/`)
- [x] No secrets committed (`.env` is git-ignored; review before pushing)
- [x] Upstream error mapping reviewed — friendly messages for 404 / 401 / 429 / 5xx / timeout / offline
- [x] Health check reports database and weather-key status
- [x] Manual UI flows verified (search, geolocation, charts, insights, alerts, favorites, themes)

### Configuration
- [x] Production MongoDB Atlas cluster provisioned and connected
- [x] Backend environment variables configured on Render (table in §3)
- [x] `VITE_API_BASE_URL` configured on Vercel for the frontend build
- [x] CORS `CLIENT_ORIGIN` set to the final frontend URL

### Post-Deploy (§5)
- [x] Health check returns 200
- [x] Public smoke tests return valid JSON with no `5xx`
- [x] Auth protection enforced on user-scoped routes (401 without a token)
- [x] Rate-limit headers present on weather responses
- [ ] Full authenticated UI walkthrough (§5.4) — recommended before the final demo

> **Go-live completed 20 October 2026.** Frontend and backend are publicly reachable; the backend health check reports MongoDB connected and the OpenWeatherMap key configured. Public weather endpoints (current, forecast, search, insights) return `200`; protected routes return `401` without a JWT.

### Not part of this delivery
- [ ] Offline banner / reconnect refresh — not implemented
- [ ] Automatic retry with exponential backoff — not implemented
- [ ] Air Quality Index — not implemented
- [ ] Formal accessibility audit — not performed

---

## 3. Environment Variables Matrix

### Backend (Render → Environment)

| Variable | Required | Example / Production Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5000` (or provider-assigned) | HTTP port |
| `NODE_ENV` | Yes | `production` | Enables production error hygiene |
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster0.mongodb.net/weather_dashboard` | Database connection |
| `WEATHER_API_KEY` | Yes | `a1b2c3d4e5f6...` | OpenWeatherMap key (server-side only) |
| `CLIENT_ORIGIN` | Yes | `https://weather-application-frontend-seven.vercel.app` | Allowed CORS origin (matches the deployed frontend) |
| `JWT_SECRET` | Yes | `<64-char random hex>` | JWT signing key |
| `JWT_EXPIRES_IN` | No | `7d` | Access-token lifespan |
| `CACHE_TTL_SECONDS` | No | `600` | In-memory weather cache TTL |
| `OPENWEATHER_BASE_URL` | No | `https://api.openweathermap.org/data/2.5` | Override (testing only) |
| `AI_GATEWAY_API_KEY` | No | `...` | Vercel AI Gateway key for LLM insights |
| `AI_GATEWAY_BASE_URL` | No | `https://ai-gateway.vercel.sh/v1` | AI Gateway base URL |
| `AI_GATEWAY_MODEL` | No | `openai/gpt-4o-mini` | Chat model for insights |
| `OPENAI_API_KEY` | No | `sk-...` | Direct OpenAI-compatible alternative |
| `OPENAI_BASE_URL` | No | `https://api.openai.com/v1` | Direct OpenAI base URL |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Direct OpenAI model |

> **One Call 3.0:** uses the same `WEATHER_API_KEY`. No subscription is required for the app to work — the backend silently falls back to the free 5-day forecast.

### Frontend (Vercel → Environment)

| Variable | Required | Example | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | `https://weather-application-s73i.onrender.com` | Backend base URL (empty in dev = Vite proxy) |

> **Security:** Never commit `.env`, JWT secrets, database credentials, or API keys. Production secrets are entered through the hosting provider’s environment-variable settings only.

---

## 4. Deployment Steps

### Part A — MongoDB Atlas

1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a DB user with Read/Write access to `weather_dashboard`.
3. Network Access → allow the backend host (or `0.0.0.0/0` for free-tier demos).
4. Copy the SRV connection string into `MONGODB_URI`.

### Part B — Backend on Render

1. **New → Web Service** → connect `ICP-2AA73905-2026-REPO`.
2. Root Directory: `Week4/Weather Application/backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add every required backend variable from §3.
6. Deploy → live URL: `https://weather-application-s73i.onrender.com`.
7. Verify `GET /health` returns **200** before touching the frontend.

Expected health response:

```json
{
  "ok": true,
  "status": "ok",
  "timestamp": "2026-10-20T10:00:00.000Z",
  "services": {
    "database": "connected",
    "weatherApi": "configured"
  }
}
```

### Part C — Frontend on Vercel

1. **Import Project** → same repository.
2. Root Directory: `Week4/Weather Application/frontend`
3. Framework Preset: **Vite** — Build: `npm run build` — Output: `dist`
4. Set `VITE_API_BASE_URL` to the Render URL.
5. Add the SPA rewrite for client-side routes (`/auth`, `/alerts`):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

6. Deploy → live URL: `https://weather-application-frontend-seven.vercel.app`.

### Part D — Connect the Two

Update the backend `CLIENT_ORIGIN` to the **exact** frontend origin (scheme + host, no trailing slash) and redeploy the backend. Mismatched CORS is the most common cause of “works locally, fails live.”

> **Completed:** `CLIENT_ORIGIN` is set to `https://weather-application-frontend-seven.vercel.app`, and a production request from that origin returns `access-control-allow-origin` correctly.

---

## 5. Post-Deployment Verification

### 5.1 Health Check

```text
GET https://weather-application-s73i.onrender.com/health
```

Expected (and verified live): `HTTP 200` with `services.database: "connected"` and `services.weatherApi: "configured"`.

### 5.2 Smoke-Test Script

```bash
API=https://weather-application-s73i.onrender.com

curl -s $API/health
curl -s "$API/api/weather/current?city=Pune"
curl -s "$API/api/weather/forecast?city=Pune"
curl -s "$API/api/weather/search?q=Tokyo"
curl -s "$API/api/weather/insights?city=Pune&unit=C"
```

All should return JSON with no `5xx`. A missing city should return a friendly 404 error object, not a stack trace.

### 5.3 Authenticated Endpoint Checks

```bash
# 1. Sign up (or sign in) and capture the token
TOKEN=$(curl -s -X POST "$API/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"your-password"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).data.token")

# 2. Use the token for user-scoped routes
curl -s -H "Authorization: Bearer $TOKEN" "$API/api/weather/favorites"
curl -s -H "Authorization: Bearer $TOKEN" "$API/api/weather/alerts/history"
curl -s -H "Authorization: Bearer $TOKEN" "$API/api/settings"
```

### 5.4 Manual UI Verification

| # | Flow | Expected |
| :---: | :--- | :--- |
| 1 | Open the live frontend | Dashboard loads; no console CORS errors |
| 2 | Search a city | Suggestions appear; results update |
| 3 | Allow geolocation | Auto-locates; deny path shows manual-search fallback |
| 4 | Sign up → sign out → sign in | JWT round-trip works; session survives reload |
| 5 | Star two cities | Favorites persist across sessions/devices |
| 6 | Set alert thresholds, open `/alerts` | Preview and history render |
| 7 | Toggle °C/°F and dark/light | Preferences persist (`localStorage`) |
| 8 | Search an invalid city | Friendly “city not found” message, no crash |
| 9 | Run the app with no AI key | Rule-engine briefing still appears |
| 10 | Resize to mobile width | Layout stacks without overflow |

> **Not tested because not implemented:** DevTools offline banner, automatic retry/backoff, Air Quality Index tile.

---

## 6. Monitoring, Limits & Rollback

### Health & uptime
- Point an uptime monitor (UptimeRobot / Render checks) at `/health` every 5 minutes.
- Free-tier hosts sleep after inactivity — expect a cold start of 20–60 s. The frontend shows a friendly error if the first request times out; the user can retry manually.

### Rate limits & quota
- Free OpenWeatherMap plan: 60 calls/min, 1,000,000 calls/month.
- Protection in place: 600 s TTL cache, three rate-limiter tiers (weather 30/min, insights 10/min, auth 20/15 min), search debounce, normalized payloads.
- Watch quota in the OWM dashboard during the first week.

### Log review
- Render → Logs: look for `[error]`, `[insights] LLM unavailable`, `[alerts]`, and Mongo connection warnings.
- Error body shape: `{ "ok": false, "error": "..." }` — no stack traces in production.

### Rollback
1. Render → previous deploy (instant rollback) or redeploy the last green commit.
2. Vercel → Instant Rollback to the previous deployment.
3. Database changes are additive only (no destructive migrations), so rollback never requires a data restore.

---

## 7. Deployment Checklist

### Backend
- [x] Deployed on Render with required env vars
- [x] MongoDB Atlas connected
- [x] JWT + CORS configured (`CLIENT_ORIGIN` matches frontend)
- [x] Rate limits + cache active
- [x] `/health` returns 200 with `database: connected`

### Frontend
- [x] Deployed on Vercel with `VITE_API_BASE_URL`
- [x] SPA rewrites configured (`/auth`, `/alerts`)
- [x] Production build verified (`dist/`)

### Verification
- [x] Public smoke tests pass (`/health`, current, forecast, search, insights → `200`)
- [x] Auth protection verified (`/api/weather/favorites`, `/api/settings` → `401` without a token)
- [x] CORS verified for the production frontend origin
- [x] Frontend app shell and `/auth` route load successfully
- [ ] Full authenticated UI walkthrough (§5.4) — recommended before the final demo
- [ ] Uptime monitoring — recommended follow-up

---

## 8. Live Links

| Service | Platform | URL | Status |
| :--- | :--- | :--- | :---: |
| **Frontend** | Vercel | [https://weather-application-frontend-seven.vercel.app/](https://weather-application-frontend-seven.vercel.app/) | ✅ Live |
| **Backend API** | Render | [https://weather-application-s73i.onrender.com/](https://weather-application-s73i.onrender.com/) | ✅ Live |
| **Health check** | Render | [https://weather-application-s73i.onrender.com/health](https://weather-application-s73i.onrender.com/health) | ✅ `200 OK` |
| **Database** | MongoDB Atlas | _cluster private_ | ✅ Connected |
| **Repository** | GitHub | [ICP-2AA73905-2026-REPO](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git) | ✅ Active |

**Deployment verified:** 20 October 2026 — health check returned `200 OK`, `database: "connected"`, `weatherApi: "configured"`, and `GET /api/weather/current?city=Pune` returned live weather data with the production CORS origin allowed. Forecast, search, and insights endpoints also returned `200`; protected routes returned `401` without a token, confirming auth enforcement and `rate-limit` headers were present.

---

**Project 2 is complete, deployed, and verified live: 22/22 tests passing, production build succeeds, frontend on Vercel and backend on Render are publicly reachable.**
