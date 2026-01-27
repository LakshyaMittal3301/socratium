---
name: commit-msg
description: Draft 3 concise commit message options (incl. Conventional Commits) for the current change; use plan slice title if available; do not run git commands.
---

## Commit message helper

### Goal
Give the human good commit messages without taking over git.

### Behavior rules
- Do not run git commands.
- If a plan/refactor doc exists for the current work, use:
  - slice name + intent + scope.
- If the diff/changes are unclear, ask for a one-sentence summary.

### Output
Provide 3 options:
1) Conventional Commit (recommended)
2) Plain imperative
3) Slightly more descriptive (with optional body)

Format:
- Option 1: `type(scope): summary`
  - Body: 1–3 bullets (optional)
- Option 2: `Summary in imperative voice`
- Option 3: `Summary + why`

Common types: feat, fix, refactor, chore, docs
