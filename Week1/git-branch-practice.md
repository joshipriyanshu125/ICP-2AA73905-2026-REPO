# Git Branching Strategy & Practice Guide

## Overview

This document outlines Git branching conventions and hands-on workflow steps for Windows OS.

---

## Branch Naming Conventions

- `main`: Production-ready stable codebase.
- `feature/*`: New feature development (e.g., `feature/task-crud`).
- `bugfix/*`: Bug fixes (e.g., `bugfix/weather-api-timeout`).
- `docs/*`: Documentation updates (e.g., `docs/week1-notes`).

---

## Hands-On Branching Steps

### 1. Create and Work on a Branch
```powershell
git checkout main
git pull origin main
git checkout -b feature/task-manager-setup
```

### 2. Make & Commit Changes
```powershell
git add .
git commit -m "feat: setup task manager structure"
```

### 3. Push & Merge Branch
```powershell
git push -u origin feature/task-manager-setup
git checkout main
git merge feature/task-manager-setup
git push origin main
git branch -d feature/task-manager-setup
```

---

## Pull Request (PR) Workflow

1. Push feature branch to GitHub.
2. Open Pull Request (PR) against `main`.
3. Review code changes and merge PR.
