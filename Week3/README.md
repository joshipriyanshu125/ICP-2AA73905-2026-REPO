# Week 3: Project 1 Completion

## Intern Career Path — Web Development
**Portal ID:** `ICP-2AA73905-2026`  
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)  
**Project Name:** TaskFlow — Full-Stack Real-Time Task Management System  
**Internship Week:** Week 3  

---

## 📋 Objectives & Deliverables Summary

| Target Task | Status | Implementation Details |
| :--- | :---: | :--- |
| **Complete Project 1 with Polished UI/UX** | ✅ Completed | Fully responsive editorial UI, Status Metric Cards, Drag-and-Drop List View, Interactive Month Calendar View with Priority Chips, and Tagging System. |
| **Real-Time Architecture & Event Pipeline** | ✅ Completed | End-to-end distributed event pipeline: `Task Update → MongoDB → EventBus → Redis Pub/Sub → Socket.IO Rooms → Live UI Sync`. |
| **Production Build & Verification** | ✅ Completed | Zero-error Vite frontend build + 14/14 automated backend test suites passing. |
| **Live Hosting & Deployment Guide** | ✅ Completed | Comprehensive multi-platform deployment instructions (Vercel / Render / Railway / Docker / MongoDB Atlas / Redis Cloud). |
| **Technical Documentation & Learnings** | ✅ Completed | Comprehensive architectural breakdown, API contracts, security configurations, and key engineering takeaways. |

---

## 🚀 Project Overview: TaskFlow

**TaskFlow** is a modern, high-performance collaborative task management system built on the **MERN** stack (MongoDB, Express, React, Node.js) reinforced with **Redis Pub/Sub** and **Socket.IO** for instantaneous multi-user synchronization.

### Key Highlights:
* **Editorial Design System:** Built with an intentional warm color palette, custom serif and sans typography, and micro-animations for focus and clarity.
* **Dual View Modes:**
  * **List View:** Full drag-and-drop task ordering, priority pill indicators, category tags, inline completion checkboxes, and quick actions.
  * **Calendar View:** Complete interactive month view with day grids, current-day indicator, priority-coded chips, direct date-cell task creation, and a priority legend.
* **Multi-Metric Dashboard:** Real-time counters for *Total tasks*, *To do*, *In progress*, and *Done* with color-coded status badges.
* **Granular Filtering & Search:** Real-time search by keyword across titles and descriptions, filtered by status, priority, category, tags, and custom sort order.
* **Real-time Collaboration:** Cross-client real-time synchronization backed by Redis Pub/Sub channels and Socket.IO room subscriptions (`workspace:<id>`, `project:<id>`).
* **Robust Security & Resilience:** JWT authentication with refresh token rotation, bcrypt password hashing, dynamic rate limiting, XSS sanitization, and automated test-domain email filtering.

---

## 🏗️ Architectural Data Flow

```
+-------------------------------------------------------------+
|                       Client Action                         |
|      (User creates, edits, reorders, or deletes a task)     |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     REST API Request                        |
|       (PATCH /api/tasks/:id with JWT Bearer Token)          |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                    MongoDB Database Sync                    |
|        (Mongoose updates document & Activity history)       |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                   Backend App Event Bus                     |
|           (Node.js EventEmitter fires task:updated)         |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                      Redis Pub/Sub                          |
|    (Publishes message across distributed backend instances) |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                    Socket.IO Server                         |
|     (Broadcasts to project & workspace subscriber rooms)    |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|               All Connected Active Clients                  |
|    (React state updates instantly without page refresh)     |
+-------------------------------------------------------------+
```

---

## 📂 Week 3 Documentation Index

1. [Project 1 Detailed Completion Report](./project-1-completion-report.md) — Exhaustive breakdown of features, UI components, database schemas, and testing results.
2. [Production Deployment & Hosting Guide](./deployment-guide.md) — Step-by-step instructions for deploying the frontend to Vercel and backend to Render / Railway / Docker.
3. [Full Documentation & Engineering Learnings](./documentation.md) — Complete technical journal detailing engineering challenges, troubleshooting, and architectural learnings.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Vanilla CSS (Design Tokens & Glassmorphism), Lucide Icons, Socket.IO Client |
| **Backend** | Node.js (ES Modules), Express 5, Socket.IO, Multer, Nodemailer, Web-Push |
| **Database & Cache** | MongoDB (Mongoose ODM), Redis (ioredis Pub/Sub & Caching layer) |
| **Testing & Quality** | Node.js Test Runner (`node:test`, `node:assert/strict`), Vite Production Bundler |
| **Security & Auth** | JWT (Access & Refresh Tokens), Bcrypt.js, Express-Rate-Limit, Input Sanitization |

---

## 💡 Key Engineering Learnings

1. **Distributed Real-Time Scaling with Redis Pub/Sub:**
   * Traditional single-process WebSockets fail when multiple server instances or containers are deployed behind a load balancer. Integrating a dedicated Redis Pub/Sub layer (`ioredis`) guarantees that socket events broadcast globally across all instances while maintaining an in-memory fallback for local development.

2. **Resilient Event-Driven Architecture:**
   * Separating database write operations from external side-effects (push notifications, emails, websocket emissions) using an application event bus prevents slow third-party services from degrading API latency.

3. **Production Mailer Resilience & Bounce Handling:**
   * Connecting live SMTP credentials (e.g. Gmail) requires safeguards against automated test scripts generating dummy emails (`@test.com`). Implementing domain filtering prevents mail delivery subsystem bounce-backs from cluttering administrator inboxes.

4. **Optimistic UI with Real-Time Reconciliation:**
   * Providing instantaneous UI feedback on client interactions (e.g. drag-and-drop or status toggle) coupled with background websocket confirmation creates a seamless user experience.
