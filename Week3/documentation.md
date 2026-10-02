# Week 3: Project 1 Full Technical Documentation & Retrospective

**Internship Portal ID:** `ICP-2AA73905-2026`  
**Repository:** [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git)  
**Project:** TaskFlow (Full-Stack Real-Time Task Management System)  
**Internship Week:** Week 3  

---

## 1. System Architecture & High-Level Design

TaskFlow implements a modern decoupled client-server architecture with an asynchronous pub/sub real-time synchronization layer.

```
                           +---------------------------------------+
                           |          Browser Client (SPA)         |
                           |   React 18 + Vite 6 + Socket.IO-Client|
                           +---------------------------------------+
                                        |             ^
                      HTTPS REST Requests       WebSocket Bi-directional Sync
                                        |             |
                                        v             v
                           +---------------------------------------+
                           |       Node.js / Express 5 API         |
                           |     Security Middleware, Validators   |
                           +---------------------------------------+
                                   |                       |
                                   v                       v
                     +--------------------------+   +--------------------------+
                     |    MongoDB Database      |   |      App Event Bus       |
                     |  Mongoose Collections    |   |    EventEmitter Layer    |
                     +--------------------------+   +--------------------------+
                                                                   |
                                                                   v
                                                    +--------------------------+
                                                    |      Redis Pub/Sub       |
                                                    |  Cross-Instance Broadcast|
                                                    +--------------------------+
                                                                   |
                                                                   v
                                                    +--------------------------+
                                                    |     Socket.IO Server     |
                                                    |   Room-based Emitters    |
                                                    +--------------------------+
```

---

## 2. Frontend Engineering & Design System

### 2.1 Aesthetic Philosophy
The interface follows an editorial design language inspired by print aesthetics:
* **Color Hierarchy:**
  * Base Background: `#FAF7F2` (Warm porcelain with subtle radial gradient).
  * Brand Accent: `#C25508` (Terracotta burnt orange).
  * Status Accent Palette:
    * Total Tasks: White Card (`#FFFFFF`) with dark charcoal counter.
    * To Do: Warm Stone (`#E5E0D8`) with alert icon.
    * In Progress: Vibrant Cyan (`#2EC5E8`) with directional arrow.
    * Done: Soft Green (`#68C27E`) with verified checkmark.
* **Typography:** Modern serif headings paired with clean sans-serif body text (`Plus Jakarta Sans`).

### 2.2 Dual View Implementations
1. **Interactive List View:**
   * HTML5 draggable items with real-time positional reordering.
   * Optimistic completion toggles.
   * Priority and category pill styling.
   * Relative deadline calculations (`Today`, `Tomorrow`, `Yesterday`, etc.).
2. **Interactive Month Calendar View:**
   * 7-column calendar matrix (Mon - Sun).
   * Active month navigation with `Today` jump button.
   * Highlighted today marker with a solid terracotta circular badge.
   * Priority-coded event chips (`#FEE2E2` for High/Urgent, `#FEF3C7` for Medium, `#DCFCE7` for Low).
   * Direct date cell click to open task creator with pre-filled date.

---

## 3. Real-Time Distributed Architecture

### 3.1 The Event Loop & Redis Pub/Sub
To guarantee multi-instance horizontal scalability, all task modifications trigger a distributed real-time flow:
1. Client makes an authorized `PATCH /api/tasks/:id` request.
2. MongoDB document is updated and an `Activity` audit record is stored.
3. Node.js `AppEventBus` emits `task:updated`.
4. Event Bus serializes the payload to Redis Pub/Sub on channel `taskflow:realtime`.
5. All connected backend instances receive the message from Redis.
6. Each backend forwards the message to targeted Socket.IO rooms (`project:<projectId>`, `workspace:<workspaceId>`).
7. All connected browser clients receive the websocket frame and instantly reconcile their React state.

---

## 4. Security, Resilience & Email Handling

### 4.1 Automated Test Domain Filtering
When live Gmail SMTP credentials were connected, automated test runs with addresses like `validation-1790918427345@test.com` previously caused Google Mailer-Daemon bounce notices. 

**Solution:** In `backend/src/services/email.js`, all incoming emails are evaluated against test domain regex patterns (`/@(test\.com|example\.com|test\.invalid|localhost)$/i`) and `NODE_ENV === "test"`. Real user emails proceed normally, while automated test dispatches are safely simulated.

### 4.2 Modal UX & Autofill Resilience
The authentication modal incorporates:
* **`onMouseDown` propagation guard:** Both `onClick` and `onMouseDown` events on `modal-content` call `e.stopPropagation()`, preventing the overlay's dismiss handler from firing when users interact with form inputs, the password toggle, or other interactive elements inside the modal.
* **Client-side pre-validation:** Form inputs are validated synchronously (non-empty email, name for signup, password ≥ 8 chars) _before_ `setLoading(true)` and any API call, so errors surface instantly without a loading spinner.
* Show/Hide password toggle (`Eye`/`EyeOff`).
* Explicit autocomplete properties (`new-password`, `current-password`, `name`, `email`).
* `switchMode()` helper resets `password`, `showPassword`, `error`, and `name` state when toggling between Sign In / Sign Up, preventing stale state from affecting the opposite form.

### 4.3 Push Notification Service Mode Transparency
* VAPID key config defaults changed from dummy strings to `null` so the truthiness check correctly identifies unconfigured environments.
* Startup log now distinguishes between:
  * `"Push notification service initialized (VAPID keys active)."` — real keys configured.
  * `"Push notification service running in simulation mode (no VAPID keys configured)."` — keys absent.
  * `"Push notification service failed to initialize: <reason>"` — keys present but invalid.

---

## 5. Verification & Deliverables Checklist

- [x] Complete Project 1 codebase with polished UI/UX matching target design specifications.
- [x] Full real-time synchronization via Redis Pub/Sub & WebSockets.
- [x] 14/14 automated backend unit/integration tests passing.
- [x] Frontend production bundle verified with Vite build.
- [x] Complete production deployment guide for Vercel, Render, MongoDB Atlas, and Redis Cloud.
- [x] GitHub repository with clean commit history: [https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git](https://github.com/joshipriyanshu125/ICP-2AA73905-2026-REPO.git).
