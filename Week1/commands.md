# Command Line & Git Quick Reference

## Overview

A concise command cheat sheet for Windows PowerShell, Git Bash, Git VCS, and NPM.

---

## Terminal Commands (PowerShell vs Git Bash)

| Action | PowerShell | Git Bash |
| :--- | :--- | :--- |
| **Print Directory** | `pwd` | `pwd` |
| **List Files** | `ls` | `ls -la` |
| **Change Directory** | `cd path` | `cd path` |
| **Create Directory** | `mkdir folder` | `mkdir folder` |
| **Create File** | `New-Item file.txt` | `touch file.txt` |
| **Delete File** | `Remove-Item file.txt` | `rm file.txt` |
| **Clear Screen** | `cls` | `clear` |

---

## Git Commands Cheat Sheet

### Setup & Status
```bash
git init
git clone <repo-url>
git status
```

### Staging & Committing
```bash
git add .
git commit -m "commit message"
```

### Branching & Merging
```bash
git branch
git checkout -b feature/branch-name
git checkout main
git merge feature/branch-name
git branch -d feature/branch-name
```

### Remote & Sync
```bash
git remote -v
git push origin main
git pull origin main
git log --oneline --graph --all
```

---

## NPM Commands

```powershell
npm init -y
npm install <package-name>
npm install --save-dev <package-name>
npm run dev
```
