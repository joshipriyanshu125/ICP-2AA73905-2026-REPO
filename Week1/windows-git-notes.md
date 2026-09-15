# Web Development Ecosystem & Core Tools

## Overview

This document covers the core concepts of the Web Development Ecosystem and fundamental development tools.

---

## Web Ecosystem Fundamentals

### Client-Server Architecture
- **Client (Frontend):** Web browser (Chrome, Edge) rendering HTML/CSS and executing JavaScript.
- **Server (Backend):** Handles business logic, API requests, and database interactions (Node.js, Express).
- **Database:** Persists application data (MongoDB, PostgreSQL).


### HTTP/HTTPS Protocol
- **Methods:** `GET` (retrieve), `POST` (create), `PUT`/`PATCH` (update), `DELETE` (remove).
- **Status Codes:**
  - `200 OK`: Request succeeded.
  - `201 Created`: Resource created.
  - `400 Bad Request`: Client error.
  - `404 Not Found`: Resource missing.
  - `500 Internal Server Error`: Server failure.


### Browser Rendering Process
1. **DNS & Connection:** Domain resolution and HTTP GET request.
2. **DOM Tree:** Parse HTML structure.
3. **CSSOM Tree:** Parse CSS styles.
4. **Render Tree:** Combine DOM + CSSOM for layout calculation.
5. **Painting & JS:** Draw pixels on screen and execute JavaScript logic.

---


## Core Development Tools

### 1. HTML5
- Skeleton and structural markup of web applications.
- Key elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<form>`, `<input>`.


### 2. CSS3
- Visual presentation, layouts, and responsiveness.
- **Box Model:** Margin -> Border -> Padding -> Content.
- **Layouts:** Flexbox (1D alignment) and CSS Grid (2D layouts).


### 3. JavaScript (ES6+)
- Adds interactive logic and dynamic behavior.
- Core features: `const`/`let`, Arrow functions, DOM Manipulation, Promises, `async`/`await`, Fetch API, `LocalStorage`.


### 4. Git & Terminal Basics
- **Git:** Distributed Version Control System tracking changes and enabling branching workflows.
- **Windows CLI:** PowerShell and Git Bash terminals.
