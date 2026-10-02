# Week 3: Production Deployment & Live Hosting Guide

**Internship Portal ID:** `ICP-2AA73905-2026`  
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)  
**Project:** TaskFlow (Full-Stack MERN + Redis + Socket.IO)  

---

## 1. Production Architecture Overview

```
+---------------------------+         +-------------------------------+
|     Vercel / Netlify      |         |        Render / Railway       |
|    Frontend (React/Vite)  | <-----> |   Backend API & WebSockets    |
|   https://taskflow.app    |  HTTPS  |   https://api.taskflow.app    |
+---------------------------+   WSS   +-------------------------------+
                                                      |
                                                      |
                   +----------------------------------+----------------------------------+
                   |                                                                     |
                   v                                                                     v
+--------------------------------------+                             +--------------------------------------+
|           MongoDB Atlas              |                             |             Redis Cloud              |
|   Managed Cluster (Primary Store)    |                             |      Managed Redis Pub/Sub & Cache   |
+--------------------------------------+                             +--------------------------------------+
```

---

## 2. Environment Variables Matrix

### Backend Environment Variables (`.env`)

| Variable Name | Required | Example / Production Value | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `5000` (Assigned by hosting provider) | HTTP & WebSocket port. |
| `NODE_ENV` | Required | `production` | Enables production security & optimizations. |
| `MONGODB_URI` | Required | `mongodb+srv://<user>:<pass>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority` | MongoDB connection URI. |
| `JWT_SECRET` | Required | `a-very-long-and-secure-random-string-64-chars` | Key for signing access tokens. |
| `JWT_EXPIRES_IN` | Optional | `7d` | Access token lifespan. |
| `CLIENT_ORIGIN` | Required | `https://your-frontend.vercel.app` | Allowed CORS origin for API & Socket.IO. |
| `REDIS_URL` | Required | `redis://default:<password>@redis-12345.upstash.io:6379` | Managed Redis instance for Pub/Sub. |
| `SMTP_HOST` | Optional | `smtp.gmail.com` / `smtp.sendgrid.net` | Email host provider. |
| `SMTP_PORT` | Optional | `465` (SSL) or `587` (TLS) | Email service port. |
| `SMTP_USER` | Optional | `your-email@gmail.com` | SMTP account username. |
| `SMTP_PASS` | Optional | `your-app-specific-password` | SMTP account password/app key. |
| `EMAIL_FROM` | Optional | `"TaskFlow <noreply@taskflow.app>"` | Sender address header. |
| `VAPID_PUBLIC_KEY` | Optional | `BMVjc7__vSHhKw_Uvs_DQiRJABtpYT-...` | Web Push VAPID public key. |
| `VAPID_PRIVATE_KEY` | Optional | `mhT4607xEnseFZRhXu2NkqHPOnaAY5...` | Web Push VAPID private key. |
| `VAPID_SUBJECT` | Optional | `mailto:admin@taskflow.app` | VAPID contact subject. |
| `UPLOAD_DIR` | Optional | `./uploads` | Storage directory for attachments. |

---

## 3. Step-by-Step Deployment Instructions

### Part A: Database & Redis Provisioning

1. **MongoDB Atlas Cluster:**
   * Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   * Create a database user with Read/Write access to the `taskflow` database.
   * Under **Network Access**, add `0.0.0.0/0` (or the specific IP range of your backend host).
   * Copy the SRV connection string into `MONGODB_URI`.

2. **Redis Cloud / Upstash:**
   * Provision a free Redis database on [Upstash](https://upstash.com) or [Redis Cloud](https://redis.com).
   * Copy the connection string into `REDIS_URL`.

---

### Part B: Backend Deployment (Render / Railway)

#### Deploying on Render:
1. Connect your GitHub repository: `https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git`.
2. Select **Web Service**.
3. Set **Root Directory:** `Week2/Task Management/backend` (or deployment root).
4. Set **Build Command:** `npm install`.
5. Set **Start Command:** `npm start`.
6. Add the environment variables from the matrix above in the **Environment** tab.
7. Deploy the service. Note down your backend URL (e.g. `https://taskflow-api.onrender.com`).

---

### Part C: Frontend Deployment (Vercel / Netlify)

#### Deploying on Vercel:
1. Import your GitHub repository in the [Vercel Dashboard](https://vercel.com).
2. Set **Root Directory:** `Week2/Task Management/frontend`.
3. Set **Framework Preset:** `Vite`.
4. Set **Build Command:** `npm run build`.
5. Set **Output Directory:** `dist`.
6. Add single-page application routing rewrite in `vercel.json` if necessary:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "https://taskflow-api.onrender.com/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
7. Click **Deploy**. Note down your live URL (e.g. `https://taskflow-app.vercel.app`).
8. Return to your backend hosting settings and update `CLIENT_ORIGIN` to match your live Vercel URL.

---

## 4. Post-Deployment Verification & Health Check

1. **API Health Endpoint:**
   * Navigate to `https://<your-backend-url>/health`
   * Expected Response (`HTTP 200 OK`):
   ```json
   {
     "status": "ok",
     "timestamp": "2026-10-02T11:00:00.000Z",
     "services": {
       "database": "connected",
       "redis": "connected",
       "scheduler": "active",
       "storage": "local"
     }
   }
   ```

2. **Real-Time WebSockets Check:**
   * Open the live frontend in two separate browser windows.
   * Sign in to the same account / workspace.
   * Create or update a task in window 1; confirm that window 2 updates **instantly without page reload**.
