# Week 3: Project 1 Final Documentation (Day 1–7)

**Internship Portal ID:** `ICP-2AA73905-2026`
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)
**Project:** TaskFlow (Full-Stack Real-Time Task Management System)
**Internship Week:** Week 3

---

## Day 1 — Final Codebase Audit & Documentation Alignment

- Reviewed Week 2 implementation files to capture the final, complete state of the TaskFlow codebase.
- Verified all frontend components, backend services, routes, and configuration match the actual code on disk.
- Confirmed the project structure:
  - `Week2/Task Management/frontend/src/` — React + Vite SPA
  - `Week2/Task Management/backend/src/` — Express + Mongoose API
  - `Week2/Task Management/backend/tests/` — Automated test suite
  - `Week3/` — Documentation & deployment artifacts

---

## Day 2 — Frontend Engineering & Component Architecture

### Final Frontend Stack
- **React 18** with Vite 6, Vanilla CSS (design tokens), Lucide Icons, Socket.IO Client.

### Component Inventory (`frontend/src/components/`)
| Component | File | Purpose |
| :--- | :--- | :--- |
| `Navbar` | `Navbar.jsx` | Top navigation with workspace switcher, auth state, view toggles |
| `LandingPage` | `LandingPage.jsx` | Editorial hero/landing showcase with demo toggle |
| `Dashboard` | `Dashboard.jsx` | Main task dashboard — list view, calendar view, filters, search |
| `AuthModal` | `AuthModal.jsx` | Sign In / Sign Up with 1-Click Demo Login, password visibility toggle |
| `TaskModal` | `TaskModal.jsx` | Create / Edit task — title, description, status, priority, category, tags, date picker |
| `TaskDetailDrawer` | `TaskDetailDrawer.jsx` | Slide-over drawer — subtasks checklist, progress bar, comments, activity log |
| `WorkspaceModal` | `WorkspaceModal.jsx` | Workspace creation & member management |
| `TeamModal` | `TeamModal.jsx` | Team management & invitations |
| `TeamBoardView` | `TeamBoardView.jsx` | Kanban board — 4 columns (To Do, In Progress, In Review, Completed) |
| `AdminPanel` | `AdminPanel.jsx` | Admin-only user & system management |

### Frontend Support Files
| File | Purpose |
| :--- | :--- |
| `api.js` | Centralised Axios/fetch API client for all REST calls |
| `socket.js` | Socket.IO client initialisation and room subscription helpers |
| `App.jsx` | Root application shell — routing, auth context, socket bootstrapping |
| `index.css` | Global design token definitions (CSS variables, typography, base resets) |

### Design System
- Warm cream canvas `#FAF7F2`, terracotta accent `#C25508`
- Serif headings (Playfair Display / Instrument Serif) + sans body (Plus Jakarta Sans)
- Status Metric Cards: Total (white), To Do (stone `#E5E0D8`), In Progress (cyan `#2EC5E8`), Done (green `#68C27E`)

---

## Day 3 — Real-Time Backend Architecture & Event Pipeline

### Backend Stack
- **Node.js (ES Modules)** + **Express 5** + **Socket.IO** + **Mongoose** + **Redis (ioredis)**

### Final Backend Directory Structure
```
Week2/Task Management/backend/
├── package.json
├── src/
│   ├── config.js              # All env config (PORT, MONGODB_URI, JWT, SMTP, VAPID, Redis…)
│   ├── db.js                  # Mongoose connection helper
│   ├── server.js              # Express + HTTP server bootstrap, Socket.IO init
│   ├── middleware/
│   │   ├── auth.js            # JWT Bearer requireAuth middleware
│   │   ├── errorHandler.js    # Centralised error handler + 404 handler
│   │   └── rateLimiter.js     # apiLimiter + authLimiter (express-rate-limit)
│   ├── models/
│   │   ├── index.js           # Barrel re-export
│   │   ├── Activity.js        # Immutable activity/audit log
│   │   ├── Attachment.js      # File attachment metadata
│   │   ├── Comment.js         # Task discussion comments
│   │   ├── Label.js           # Task labels / tags
│   │   ├── Notification.js    # In-app notification feed
│   │   ├── Project.js         # Project metadata
│   │   ├── Session.js         # Refresh token session tracking
│   │   ├── Subtask.js         # Checklist subtask items
│   │   ├── Task.js            # Primary task entity
│   │   ├── Team.js            # Team groupings
│   │   ├── User.js            # User account & credentials
│   │   ├── UserRole.js        # Role management
│   │   ├── Workspace.js       # Workspace document
│   │   └── WorkspaceMember.js # Workspace ↔ User membership + role
│   ├── routes/
│   │   ├── admin.js           # Admin user & system management
│   │   ├── ai.js              # AI-assisted task features
│   │   ├── analytics.js       # Usage & productivity analytics
│   │   ├── auth.js            # Signup, signin, refresh, logout, me
│   │   ├── labels.js          # Label CRUD
│   │   ├── notifications.js   # Notification feed & read-status
│   │   ├── projects.js        # Project CRUD & membership
│   │   ├── search.js          # Cross-entity full-text search
│   │   ├── settings.js        # User preference settings
│   │   ├── tasks.js           # Task CRUD, reorder, subtasks, comments
│   │   ├── teams.js           # Team management & invitations
│   │   ├── upload.js          # Multer file upload endpoint
│   │   ├── users.js           # User profile & avatar
│   │   └── workspaces.js      # Workspace CRUD, members, invitations
│   ├── services/
│   │   ├── email.js           # Nodemailer SMTP (test-domain filtering)
│   │   ├── events.js          # Node.js EventEmitter app-event bus
│   │   ├── pubsub.js          # ioredis Pub/Sub (taskflow:realtime channel)
│   │   ├── push.js            # Web Push (VAPID) notification dispatcher
│   │   ├── redis.js           # ioredis client + readiness flag
│   │   ├── socket.js          # Socket.IO server, room auth, event emitters
│   │   └── upload.js          # Multer storage config & MIME validation
│   ├── types/
│   │   └── index.js           # Shared JSDoc type definitions
│   ├── utils/
│   │   ├── sanitize.js        # XSS input sanitisation middleware
│   │   └── token.js           # JWT sign / verify helpers
│   └── workers/
│       └── scheduler.js       # node-cron scheduled jobs (due-date reminders)
└── tests/
    └── api.test.js            # Integration test suite (Node.js built-in runner)
```

### Core Services
| Service | File | Responsibility |
| :--- | :--- | :--- |
| App Event Bus | `services/events.js` | Node.js EventEmitter — decouples DB writes from side-effects |
| Socket.IO | `services/socket.js` | Room-based emit (`project:<id>`, `workspace:<id>`, `user:<id>`), auth middleware |
| Redis Pub/Sub | `services/pubsub.js` | Distributes events over `taskflow:realtime` channel; in-memory fallback |
| Redis Cache | `services/redis.js` | ioredis client with `isRedisReady` readiness flag |
| Email | `services/email.js` | Nodemailer SMTP with test-domain filtering (`@test.com`, `@example.com`, etc.) |
| Web Push | `services/push.js` | VAPID-authenticated Web Push notification dispatcher |
| File Upload | `services/upload.js` | Multer storage engine + MIME-type / extension validation |
| Scheduler | `workers/scheduler.js` | `node-cron` jobs for due-date reminders and overdue notifications |

### Event Flow
```
Task Update → MongoDB → AppEventBus → Redis Pub/Sub (taskflow:realtime) → Socket.IO Rooms → Live UI
```

---

## Day 4 — Security, Auth & Resilience

### Authentication
- **JWT Access + Refresh token pair** — Access token validity `7d`, refresh rotation at `/api/auth/refresh`
- **Bcrypt** password hashing (12 salt rounds)
- Server-side `Session` collection storing IP, user-agent, and token validity for full revocation

### Security Middleware Stack
| Middleware | File | Purpose |
| :--- | :--- | :--- |
| `requireAuth` | `middleware/auth.js` | Verifies JWT Bearer token; attaches `req.userId` |
| `apiLimiter` | `middleware/rateLimiter.js` | IP-based rate limiting on all `/api/*` routes |
| `authLimiter` | `middleware/rateLimiter.js` | Stricter limiter on `/api/auth` routes; test env bypass |
| `sanitizeMiddleware` | `utils/sanitize.js` | Recursively strips XSS from `req.body` / `req.query` |
| `errorHandler` / `notFound` | `middleware/errorHandler.js` | Centralised HTTP error responses + 404 fallback |

- Dynamic `CLIENT_ORIGIN` CORS configuration (environment-variable driven)

### Resilient Patterns
- Redis Pub/Sub auto-fallback to in-memory dispatch when Redis is offline
- Socket.IO client reconnection (`reconnectionAttempts: 10`, `reconnectionDelay: 1s`)
- VAPID keys default to `null` — checked with truthiness before invoking Web Push
- Config warns on missing `JWT_SECRET` or SMTP settings at startup (production: errors)

---

## Day 5 — Data Modeling & Persistence

### MongoDB Collections (Mongoose)
```
User ──┬── Session          (refresh token revocation)
       ├── Workspace        (owner reference)
       ├── WorkspaceMember  (userId + workspaceId + role + status)
       ├── Team             (workspaceId scoped)
       ├── Project          (workspaceId + teamId scoped)
       ├── Task
       │    ├── Subtask     (checklist items + completion flag)
       │    ├── Comment     (threaded discussion + authorId)
       │    └── Attachment  (multer upload + taskId)
       ├── Label            (workspaceId scoped colour labels)
       ├── Notification     (userId + isRead + type)
       └── Activity         (immutable audit log — userId + action + details)
```

### Config (`backend/src/config.js`) — All Environment Variables
| Key | Required | Default |
| :--- | :---: | :--- |
| `PORT` | No | `5000` |
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017/Task_management` |
| `JWT_SECRET` | Yes (prod) | `dev-secret-change-me` |
| `JWT_EXPIRES_IN` | No | `7d` |
| `CLIENT_ORIGIN` | Yes | `http://localhost:5173` |
| `NODE_ENV` | No | `development` |
| `REDIS_URL` | No | *(undefined — triggers in-memory fallback)* |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | No | *(warns if missing)* |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | No | `null` |
| `UPLOAD_DIR` | No | `./uploads` |
| `EMAIL_DOMAIN` | No | `null` *(test-domain filter)* |
- Startup validates `JWT_SECRET` (production error / development warning) and SMTP config (warning if incomplete)

---

## Day 6 — Testing & Quality Assurance

### Backend Test Suite
- **Test File:** `tests/api.test.js`
- **Command:** `node --test tests/**/*.test.js`
- **Runner:** Built-in Node.js Test Runner (`node:test`, `node:assert/strict`) — zero additional dependencies
- **Results:** **14 passed / 0 failed / 4 suites** (100% pass rate)

### Test Coverage by Suite
| Suite | Tests | Scenarios |
| :--- | :---: | :--- |
| **Health Check** | 1 | `/health` returns `ok` + `services` object (database, redis, timestamp) |
| **Authentication** | 7 | Short-password rejection, successful signup, duplicate rejection, signin, wrong-password rejection, `/auth/me` profile, token refresh |
| **Protected Routes** | 3 | Unauthenticated task request (401), invalid token (401), unauthenticated workspace request (401) |
| **Input Validation** | 3 | Setup user creation, empty-title task rejection (400), invalid-email signup rejection (400) |

### Frontend Production Build
- **Command:** `npm run build` (Vite 6)
- **Result:** Zero-error, zero-warning production bundle generated in `dist/` in under 5 seconds

---

## Day 7 — Final Polish, Deployment Prep & Documentation

- Verified all 10 frontend components render correctly with real API-driven state flows
- Confirmed real-time sync: task create/update/delete/reorder broadcast live via Redis Pub/Sub → Socket.IO
- Validated all deployment config paths match the actual codebase (`Week2/Task Management/backend`, `Week2/Task Management/frontend`)
- Completed all Week 3 documentation files:
  - `documentation.md` — this technical journal (Day 1–7 breakdown)
  - `project-1-completion-report.md` — exhaustive feature, API, schema, and QA breakdown
  - `deployment-guide.md` — Vercel + Render + MongoDB Atlas + Redis Cloud / Upstash steps
  - `README.md` — Week overview + data-flow architecture diagram + tech stack

### Remaining Work: Production Deployment
- [ ] Deploy backend to Render / Railway / Docker (Root Dir: `Week2/Task Management/backend`)
- [ ] Deploy frontend to Vercel / Netlify (Root Dir: `Week2/Task Management/frontend`)
- [ ] Configure all production environment variables (`MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `SMTP_*`, `VAPID_*`, `CLIENT_ORIGIN`)
- [ ] Run post-deployment health check (`/health` → all services `connected`)
- [ ] Verify real-time WebSocket sync across two live browser sessions

---

## Week 3 Summary

| Day | Focus | Status |
| :--- | :--- | :--- |
| Day 1 | Codebase audit & documentation alignment | ✅ Complete |
| Day 2 | Frontend component architecture & design system | ✅ Complete |
| Day 3 | Real-time backend event pipeline (Redis + Socket.IO) | ✅ Complete |
| Day 4 | Security, auth & resilience patterns | ✅ Complete |
| Day 5 | Data modeling & persistence layer | ✅ Complete |
| Day 6 | Testing & QA verification | ✅ Complete |
| Day 7 | Final polish & deployment preparation | ✅ Complete (deploy pending) |
