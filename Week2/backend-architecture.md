# Backend Architecture

## Architecture Overview

The application uses a **modular monolith**: one deployable backend application, divided into clear feature modules. This keeps the first version simple to develop and deploy while allowing each module to be separated later if scale requires it.

```text
┌──────────────────────┐
│ Web / Mobile Clients │
└──────────┬───────────┘
           │ HTTPS / REST
┌──────────▼───────────┐
│ API Gateway / Load   │
│ Balancer             │
└──────────┬───────────┘
           │
┌──────────▼─────────────────────────────────────────────┐
│ Backend Application — Modular Monolith                  │
│                                                         │
│  Auth       Users       Teams       Projects            │
│  Tasks      Comments    Notifications  Search           │
│  Audit      Files                                      │
└──────────┬───────────────────┬───────────────────┬─────┘
           │                   │                   │
     ┌─────▼──────┐      ┌─────▼─────┐      ┌─────▼──────┐
     │ Persistence │      │   Redis   │      │   Object   │
     │    Layer    │      │ cache/queue│     │   Storage  │
     └─────┬──────┘      └───────────┘      └────────────┘
           │
     ┌─────▼──────────┐
     │ Background Jobs│
     │ / Queue Worker │
     └─────┬──────────┘
           │
   ┌───────┼────────┬───────────┐
   ▼       ▼        ▼           ▼
 Email   Push   Scheduled    File/image
provider provider   tasks    processing
```

## Module Responsibilities

| Module | Responsibility |
|---|---|
| Auth | Registration, login, password hashing, JWT/session refresh, role checks. |
| Users | User profiles, preferences, account settings. |
| Teams | Team creation, membership, invitations, member roles. |
| Projects | Project metadata, ownership, team visibility, project status. |
| Tasks | Task CRUD, assignees, due dates, priority, status and labels. |
| Comments | Comments and threaded replies attached to tasks. |
| Notifications | In-app, email and push notification records and delivery. |
| Search | Indexed search across projects and tasks. |
| Audit | Immutable record of important user and system actions. |
| Files | File metadata and secure links to object storage. |

## Supporting Services

- **Redis:** caches frequent reads, holds rate-limit counters, and backs the background-job queue.
- **Object storage:** stores uploaded attachments and generated files.
- **Background worker:** sends email/push notifications, runs scheduled reminders, and processes uploaded files.
