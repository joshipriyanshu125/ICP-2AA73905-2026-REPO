# Week 3: Production Deployment & Live Hosting Guide

**Internship Portal ID:** `ICP-2AA73905-2026`  
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)  
**Project:** TaskFlow (Full-Stack MERN + Redis + Socket.IO)

---

## 🌐 Live Deployment — Client Access

The TaskFlow application has been successfully deployed and is accessible online.

### Frontend — TaskFlow Web Application

**Live Frontend:**  
👉 [https://taskflow-frontend-blond.vercel.app/](https://taskflow-frontend-blond.vercel.app/)

This is the main URL for clients and users to access the TaskFlow application.

### Backend — TaskFlow API

**Live Backend:**  
👉 [https://taskflow-odak.onrender.com/](https://taskflow-odak.onrender.com/)

The backend provides the REST API and WebSocket services required by the TaskFlow frontend.

### 🔗 Quick Access

| Service | Platform | Live URL |
| :--- | :--- | :--- |
| **Frontend** | Vercel | [https://taskflow-frontend-blond.vercel.app/](https://taskflow-frontend-blond.vercel.app/) |
| **Backend API** | Render | [https://taskflow-odak.onrender.com/](https://taskflow-odak.onrender.com/) |

> **Client Access:** To use the TaskFlow application, open the **Frontend URL** above. The Backend URL is provided for API/service access and deployment verification.

---

## 1. Production Architecture Overview

```text
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

### Production Components

The production architecture consists of:

- **Frontend:** React + Vite
- **Frontend Hosting:** Vercel
- **Backend:** Node.js + Express
- **Backend Hosting:** Render
- **Database:** MongoDB Atlas
- **Caching / Pub/Sub:** Redis
- **Real-Time Communication:** Socket.IO
- **Transport Security:** HTTPS / WSS
- **Version Control:** GitHub

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
| `CLIENT_ORIGIN` | Required | `https://taskflow-frontend-blond.vercel.app` | Allowed CORS origin for API & Socket.IO. |
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

> **Security:** Never commit `.env`, `.env.production`, passwords, JWT secrets, database credentials, Redis credentials, or API keys to GitHub. Production secrets should be added through the hosting provider's environment-variable settings.

---

## 3. Step-by-Step Deployment Instructions

### Part A: Database & Redis Provisioning

#### 1. MongoDB Atlas Cluster

- Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Create a database user with Read/Write access to the `taskflow` database.
- Under **Network Access**, add `0.0.0.0/0` or the specific IP range of your backend host.
- Copy the SRV connection string into `MONGODB_URI`.
- Verify that the backend can successfully connect to the cluster.

#### 2. Redis Cloud / Upstash

- Provision a free Redis database on [Upstash](https://upstash.com) or [Redis Cloud](https://redis.com).
- Copy the connection string into `REDIS_URL`.
- Verify Redis connectivity from the backend.
- Redis is used for caching and Pub/Sub functionality.

---

### Part B: Backend Deployment — Render / Railway

#### Deploying on Render

1. Connect the GitHub repository:

   ```text
   https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git
   ```

2. Select **Web Service**.

3. Set the **Root Directory**:

   ```text
   Week2/Task Management/backend
   ```

   Use the actual backend directory if the project structure differs.

4. Set the **Build Command**:

   ```bash
   npm install
   ```

5. Set the **Start Command**:

   ```bash
   npm start
   ```

6. Add all required production environment variables in the **Environment** section.

7. Make sure the following values are configured correctly:

   ```env
   NODE_ENV=production
   MONGODB_URI=<your-production-mongodb-uri>
   JWT_SECRET=<your-secure-jwt-secret>
   CLIENT_ORIGIN=https://taskflow-frontend-blond.vercel.app
   REDIS_URL=<your-production-redis-url>
   ```

8. Deploy the service.

9. The deployed backend is available at:

   **https://taskflow-odak.onrender.com/**

---

### Part C: Frontend Deployment — Vercel / Netlify

#### Deploying on Vercel

1. Import the GitHub repository into the [Vercel Dashboard](https://vercel.com).

2. Set the **Root Directory**:

   ```text
   Week2/Task Management/frontend
   ```

3. Set the **Framework Preset**:

   ```text
   Vite
   ```

4. Set the **Build Command**:

   ```bash
   npm run build
   ```

5. Set the **Output Directory**:

   ```text
   dist
   ```

6. Configure the frontend environment variables required by the application.

7. If SPA routing requires a `vercel.json`, add:

   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

8. Click **Deploy**.

9. The deployed frontend is available at:

   **https://taskflow-frontend-blond.vercel.app/**

10. Ensure the backend's `CLIENT_ORIGIN` is configured to use:

   ```text
   https://taskflow-frontend-blond.vercel.app
   ```

---

## 4. Post-Deployment Verification & Health Check

### 1. Frontend Verification

Open the live frontend:

**https://taskflow-frontend-blond.vercel.app/**

Verify that:

- The application loads successfully.
- Login/Register works.
- Tasks can be created.
- Tasks can be updated.
- Tasks can be deleted.
- Projects/workspaces load correctly.
- API requests are reaching the deployed backend.
- No CORS errors appear in the browser console.

---

### 2. API Health Endpoint

Navigate to:

```text
https://taskflow-odak.onrender.com/health
```

Expected response:

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

> The exact response depends on the implementation of the backend health-check endpoint.

A successful response should return:

```text
HTTP 200 OK
```

---

### 3. Real-Time WebSockets Check

To verify Socket.IO functionality:

1. Open the live frontend in two separate browser windows or tabs.
2. Sign in to the same account/workspace.
3. Create a task in **Window 1**.
4. Confirm that **Window 2** receives the update automatically.
5. Update a task in **Window 1**.
6. Confirm that the change appears in **Window 2** without a page reload.
7. Delete a task and verify that the deletion is synchronized across both clients.

This confirms that the deployed Socket.IO/WebSocket implementation is functioning correctly.

---

## 5. Production Deployment Checklist

### Backend

- [x] Backend deployed on Render
- [x] Production environment configured
- [x] MongoDB Atlas connected
- [x] Redis configured
- [x] JWT authentication configured
- [x] CORS configured
- [x] Socket.IO/WebSockets configured
- [x] Environment variables configured
- [x] API available online

### Frontend

- [x] React/Vite frontend deployed on Vercel
- [x] Production build configured
- [x] Backend API URL configured
- [x] Frontend accessible publicly
- [x] SPA routing configured where required

### Database & Infrastructure

- [x] MongoDB Atlas provisioned
- [x] MongoDB connection configured
- [x] Redis provisioned
- [x] Redis connection configured
- [x] Production services connected

### Verification

- [x] Frontend URL verified
- [x] Backend URL verified
- [x] API communication verified
- [x] Authentication verified
- [x] CRUD operations verified
- [x] Real-time Socket.IO communication verified

---

## 6. Final Live Application Links

### 🚀 TaskFlow Frontend

**https://taskflow-frontend-blond.vercel.app/**

### ⚙️ TaskFlow Backend API

**https://taskflow-odak.onrender.com/**

### 📦 GitHub Repository

**https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git**

---

## 7. Deployment Architecture — Final

```text
                         CLIENT / USER
                              |
                              v
                 +--------------------------+
                 |        VERCEL            |
                 |   React + Vite Frontend  |
                 |                          |
                 | taskflow-frontend-       |
                 | blond.vercel.app         |
                 +------------+-------------+
                              |
                     HTTPS / WSS
                              |
                              v
                 +--------------------------+
                 |         RENDER            |
                 |    Node.js + Express      |
                 |       + Socket.IO         |
                 |                          |
                 | taskflow-odak.onrender.com|
                 +------+-------------+-----+
                        |             |
                        |             |
                        v             v
              +-------------+   +-------------+
              |  MongoDB    |   |    Redis    |
              |    Atlas    |   | Cloud/      |
              |             |   | Upstash     |
              +-------------+   +-------------+
```

---

## 8. Client Access

The client only needs to open the following URL to use the deployed TaskFlow application:

### 👉 https://taskflow-frontend-blond.vercel.app/

The backend is deployed separately and is used by the frontend for API requests, authentication, database operations, and real-time Socket.IO communication.

**TaskFlow is now available as a live full-stack application.**
