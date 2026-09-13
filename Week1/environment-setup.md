# Environment Setup

## Overview

This document contains the environment setup and verification performed for the Web Development Self-Learning Internship on Windows.

The practical environment used for this learning program is:

- Windows 11 / Windows OS
- Git Bash / PowerShell
- Node.js & NPM
- VS Code / Antigravity IDE
- Git & GitHub

---

## Tools Installed & Configured

### 1. Git for Windows
- Version control system
- Integrated Git Bash terminal
- Default branch set to `main`
- Global username and email configured

### 2. Node.js & NPM
- JavaScript runtime environment (LTS version)
- Node Package Manager (NPM) for dependency management

### 3. VS Code Extensions
- Prettier - Code Formatter
- ESLint
- Live Server
- GitLens
- Path Intellisense

---

## Verification & Commands

### Git Version Check
```powershell
git --version
```

### Node & NPM Check
```powershell
node -v
npm -v
```

### Git Global Configuration
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf true
```

### SSH Key Setup
```powershell
ssh-keygen -t ed25519 -C "your.email@example.com"
clip < ~/.ssh/id_ed25519.pub
ssh -T git@github.com
```
