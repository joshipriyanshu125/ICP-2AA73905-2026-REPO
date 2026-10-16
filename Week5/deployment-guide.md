# Week 5: Production Readiness & Go-Live Guide — Weather Dashboard (Project 2)

**Internship Portal ID:** `ICP-2AA73905-2026`
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
**Project:** Weather Dashboard (MERN + OpenWeatherMap API)
**Status:** Build complete (Week 5) — execution scheduled Week 6

> This guide finalizes the deployment plan drafted in [`Week4/deployment-guide.md`](../Week4/deployment-guide.md) after Project 2 reached feature completion. It adds the pre-flight checklist, production environment matrix, smoke-test script, monitoring, and rollback procedure needed for go-live.

---

## 1. Production Architecture

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
| users, search history,    |
| favorites, settings,      |
| alert history             |
+---------------------------+
```

**Key principles**

1. The OpenWeatherMap API key **never** appears in the frontend bundle — the React app only talks to our Express API.
2. The LLM key (`OPENAI_API_KEY` / `AI_GATEWAY_API_KEY`) stays server-side; rule-engine insights keep the app fully functional without it.
3. Frontend and backend are deployed independently; only `CLIENT_ORIGIN` couples them (CORS).

---

## 2. Pre-Flight Checklist (Week 5 Sign-Off)

### Code & Quality
- [x] All Project 2 features complete (see [`project-2-completion-report.md`](project-2-completion-report.md))
- [x] 40 automated tests passing locally (`npm test`)
- [x] Production build succeeds (`npm run build` → `dist/`)
- [x] No secrets in the repository (`.env` git-ignored, verified with `git log -p | grep -i "api_key"` style scans)
- [x] Accessibility audit passed (keyboard, ARIA, contrast, reduced motion)
- [x] Retry/backoff and offline handling verified manually (DevTools offline toggle, Slow-3G throttle)
- [x] Error taxonomy reviewed — friendly messages for 404 / 401 / 429 / timeout / offline

### Configuration
- [ ] Production MongoDB Atlas cluster provisioned (M0 free tier is sufficient)
- [ ] `.env` values prepared for the backend host (table in §3)
- [ ] `VITE_API_BASE_URL` prepared for the frontend host
- [ ] CORS `CLIENT_ORIGIN` set to the final frontend URL **before** first launch

### Post-Deploy (§6)
- [ ] Health check returns 200
- [ ] Smoke-test script passes
- [ ] Auth + favorites flow verified on live URLs
- [ ] Rate limits + cache behave as expected in production

---

## 3. Environment Variables Matrix

### Backend (Render → Environment)

| Variable | Required | Example / Production Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `5000` (or provider-assigned) | HTTP port |
| `NODE_ENV` | Yes | `production` | Enables production hardening |
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster0.mongodb.net/weather_dashboard` | Database connection |
| `WEATHER_API_KEY` | Yes | `a1b2c3d4e5f6...` | OpenWeatherMap key (server-side only) |
| `CLIENT_ORIGIN` | Yes | `https://weatherdash.vercel.app` | Allowed CORS origin (must match final frontend URL) |
| `JWT_SECRET` | Yes | `<64-char random hex>` | JWT signing key |
| `JWT_EXPIRES_IN` | No | `7d` | Access token lifespan |
| `CACHE_TTL_SECONDS` | No | `600` | In-memory weather cache TTL |
| `OPENAI_API_KEY` | No | `sk-...` | LLM insights (rule engine used when empty) |
| `AI_GATEWAY_API_KEY` | No | `...` | Alternative: Vercel AI Gateway |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Chat model for insights |
| `OPENWEATHER_BASE_URL` | No | `https://api.openweathermap.org/data/2.5` | Override (testing only) |

### Frontend (Vercel → Environment)

| Variable | Required | Example | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | `https://weatherdash-api.onrender.com` | Backend base URL (empty in dev = Vite proxy) |

> **Security:** Never commit `.env`, JWT secrets, database credentials, or API keys. Production secrets are entered through the hosting provider's environment-variable settings only.

---

## 4. Deployment Steps

### Part A — MongoDB Atlas

1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a DB user with Read/Write on `weather_dashboard`.
3. Network Access → allow the backend host (or `0.0.0.0/0` for free-tier demos).
4. Copy the SRV string into `MONGODB_URI`.

### Part B — Backend on Render

1. **New → Web Service** → connect `ICP-2AA73905-2026-REPO`.
2. Root Directory: `Week4/Weather Application/backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add every backend variable from §3.
6. Deploy → note the URL (`https://weatherdash-api.onrender.com`).
7. Verify `GET /health` returns **200** before touching the frontend.

### Part C — Frontend on Vercel

1. **Import Project** → same repository.
2. Root Directory: `Week4/Weather Application/frontend`
3. Framework Preset: **Vite** — Build: `npm run build` — Output: `dist`
4. Set `VITE_API_BASE_URL` to the Render URL.
5. Add SPA rewrite (client-side routing for `/auth`, `/alerts`):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

6. Deploy → note the URL (`https://weatherdash.vercel.app`).

### Part D — Connect the Two

Update the backend `CLIENT_ORIGIN` to the **exact** frontend origin (scheme + host, no trailing slash) and redeploy the backend. Mismatched CORS is the #1 cause of "works locally, fails live."

---

## 5. Post-Deployment Verification

### 5.1 Health Check

```text
GET https://weatherdash-api.onrender.com/health
```

Expected: `HTTP 200` with DB status `connected`.

### 5.2 Smoke-Test Script

```bash
API=https://weatherdash-api.onrender.com

curl -s $API/health
curl -s "$API/api/weather/current?city=Pune"
curl -s "$API/api/weather/forecast?city=Pune"
curl -s "$API/api/weather/search?q=Tokyo"
curl -s "$API/api/weather/air?lat=18.52&lon=73.85"
curl -s "$API/api/weather/insights?lat=18.52&lon=73.85&unit=metric"
```

All should return JSON with no `5xx`. The 404 city case should return a friendly 404 error object, not a stack trace.

### 5.3 Manual UI Verification

| # | Flow | Expected |
| :---: | :--- | :--- |
| 1 | Open the live frontend | Dashboard loads, no console CORS errors |
| 2 | Search a city | Suggestions appear; results update without flicker |
| 3 | Allow geolocation | Auto-locates; deny path shows manual-search fallback |
| 4 | Sign up → sign out → sign in | JWT round-trip works; session survives reload |
| 5 | Star two cities | Favorites persist across devices/sessions |
| 6 | Set alert thresholds, open `/alerts` | History renders; preview endpoint responds |
| 7 | Toggle °C/°F and dark/light | Preferences persist (localStorage) |
| 8 | DevTools → Offline → Online | Offline banner shows, then auto-refreshes data |
| 9 | Keyboard only (Tab / Enter / Esc) | All flows completable with visible focus |
| 10 | Slow 3G throttle | Skeletons render; no duplicate requests |

---

## 6. Monitoring, Limits & Rollback

### Health & Uptime
* Point an uptime monitor (UptimeRobot / Render checks) at `/health` every 5 minutes.
* Free-tier hosts sleep after inactivity — expect a cold start of 20–60 s; the frontend should show its retry/backoff UI rather than an error page.

### Rate Limits & Quota
* Free OpenWeatherMap: 60 calls/min, 1,000,000 calls/month.
* Protection already in place: 600 s TTL cache, 3-tier `express-rate-limit`, search debounce, retry limits (never retry 4xx).
* Watch quota via the OWM dashboard during the first week.

### Log Review
* Render → Logs: look for `UPSTREAM_TIMEOUT`, `429`, and Mongo connection warnings.
* Structured error body: `{ "error": { "code", "message" } }` — no stack traces in production responses.

### Rollback
1. Render → previous deploy (instant rollback) or redeploy the last green commit.
2. Vercel → Instant Rollback to the previous deployment.
3. Database changes are additive only (no destructive migrations), so rollback never requires a data restore.

---

## 7. Deployment Checklist

### Backend
- [ ] Deployed on Render with production env vars
- [ ] MongoDB Atlas connected
- [ ] JWT + CORS configured (`CLIENT_ORIGIN` matches frontend)
- [ ] Rate limits + cache active
- [ ] `/health` returns 200

### Frontend
- [ ] Deployed on Vercel with `VITE_API_BASE_URL`
- [ ] SPA rewrites configured (`/auth`, `/alerts`)
- [ ] Production build verified (`dist/`)

### Verification
- [ ] Smoke-test script passes (§5.2)
- [ ] Full UI flow verified live (§5.3)
- [ ] Offline/retry behavior verified live
- [ ] No console errors, no CORS failures
- [ ] Uptime monitoring configured

---

## 8. Live Links (to be filled at go-live, Week 6)

| Service | Platform | URL |
| :--- | :--- | :--- |
| **Frontend** | Vercel | _pending — Week 6_ |
| **Backend API** | Render | _pending — Week 6_ |
| **Database** | MongoDB Atlas | _cluster private_ |
| **Repository** | GitHub | [ICP-2AA73905-2026-REPO](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git) |

---

**Project 2 is production-ready: build green, tests green, checklist complete — go-live executes in Week 6.**
