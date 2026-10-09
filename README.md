# ICP-2AA73905-2026-REPO

## Intern Career Path — Web Development

**Portal ID:** `ICP-2AA73905-2026`  
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)

---

## 📚 Internship Modules & Repository Index

| **Module** | **Title** | **Key Deliverables & Documentation** |
|---|---|---|
| [**Week 1**](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO/blob/main/Week1/README.md) | Environment Setup & Project Selection | Git workflows, environment configuration, project selection matrix, command references, and documentation. |
| [**Week 2**](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO/blob/main/Week2/README.md) | Core Engineering & Architecture | Implementation phase breakdown, research methodology, core MERN functional backend architecture, and TaskFlow codebase. |
| [**Week 3**](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO/blob/main/Week3/README.md) | Project 1 Completion & Deployment | **TaskFlow Full Completion**: Polished UI/UX (List & Calendar Views), Status Metric Cards, Redis Pub/Sub + Socket.IO real-time synchronization, 14/14 test pass suite, and production deployment guide. |
| [**Week 4**](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO/blob/main/Week4/README.md) | Project 2 Start — Weather Dashboard | **Weather Dashboard (MERN)**: OpenWeatherMap API integration (current, forecast, geocoding), current conditions card, hourly strip, recharts charts, multi-day forecast, geolocation search, JWT auth with per-user saved locations, dark/light themes, search history in MongoDB, server-side API proxy, and deployment guide. |

---

## 🚀 Project 1: TaskFlow — Real-Time Task Management System

- **Frontend:** React 18, Vite 6, Custom Editorial Design System (List & Month Calendar views).
- **Backend:** Node.js (ES Modules), Express 5, Socket.IO, Multer, Nodemailer.
- **Database & Cache:** MongoDB (Mongoose ODM), Redis (ioredis Pub/Sub & Cache layer).
- **Live Architecture:** `Task Update → MongoDB → EventBus → Redis Pub/Sub → Socket.IO Rooms → Live UI Sync`.

### 🌐 Live Deployment

- **Frontend:** [https://taskflow-frontend-blond.vercel.app/](https://taskflow-frontend-blond.vercel.app/)
- **Backend API:** [https://taskflow-odak.onrender.com/](https://taskflow-odak.onrender.com/)

### Quick Navigation

- [Week 3 Completion Report](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO/blob/main/Week3/project-1-completion-report.md)
- [Production Deployment Guide](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO/blob/main/Week3/deployment-guide.md)
- [Full Technical Documentation](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO/blob/main/Week3/documentation.md)

---

## 🌤️ Project 2: Weather Dashboard Application (Week 4 — In Progress)

- **Frontend:** React 18, Vite 6, React Router, recharts (code-split), vanilla CSS design system — dark deep-sky theme (condition-aware accents) + minimalistic light theme.
- **Backend:** Node.js (ES Modules), Express, Mongoose, zod validation, bcrypt + JWT — proxies OpenWeatherMap so the API key stays server-side.
- **Database:** MongoDB (`weather_dashboard`) — `users`, search history, per-user favorite cities.
- **External API:** OpenWeatherMap (current weather, 5-day/3-hour forecast, geocoding; optional One Call 3.0 for 7-day).
- **Data Flow:** `React UI → /api/weather/* → weatherService → OpenWeatherMap → normalized view model → MongoDB`.
- **Auth Flow:** `Sign up (/auth) → bcrypt hash → JWT → Bearer header → favorites scoped by user id`.
- **Tests:** 14/14 passing (`backend: npm test`).

### Quick Navigation

- [Week 4 README (Getting Started)](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO/blob/main/Week4/README.md)
- [Week 4 Full Technical Documentation](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO/blob/main/Week4/documentation.md)
- [Week 4 Deployment Guide](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO/blob/main/Week4/deployment-guide.md)
