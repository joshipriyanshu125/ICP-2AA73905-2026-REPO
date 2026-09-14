# Advanced Git Notes & Conflict Resolution

## Overview

A quick reference guide for Git Stash, Rebase, Conflict Resolution, and Undoing Changes on Windows OS.

---

## Git Stash

Temporarily save uncommitted work:

```bash
git stash push -m "WIP changes"
git stash list
git stash pop
```

---

## Git Merge vs Rebase

- **Git Merge:** Combines branches with a dedicated merge commit. Preserves complete history.
- **Git Rebase:** Re-applies commits on top of target branch for a clean, linear history.

```bash
git checkout feature/branch-name
git rebase main
```


---

## Merge Conflict Resolution

1. Open conflicting files in VS Code.
2. Select **Accept Current**, **Accept Incoming**, or edit markers manually (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Stage and complete merge:

```bash
git add <file>
git commit -m "fix: resolve merge conflict"
```

---

## Undoing Changes

- **Discard Unstaged Changes:** `git restore <file>`
- **Unstage Staged File:** `git restore --staged <file>`
- **Revert Commit (Safe):** `git revert HEAD`
- **Soft Reset (Keep Changes):** `git reset --soft HEAD~1`
