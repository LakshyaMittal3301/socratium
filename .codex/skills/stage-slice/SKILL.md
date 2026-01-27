---
name: stage-slice
description: Implement exactly one slice from docs/plan (or docs/refactor if specified), keep the diff small, update the plan checkbox, and provide manual verification steps.
---

## Stage: Slice (implement one slice)

### Goal
Make a small, reviewable code change corresponding to a single planned slice.

### Inputs
- Preferred: the user specifies:
  - which plan file (`docs/plan/<slug>.md` or `docs/refactor/<slug>.md`)
  - which slice number
- If missing, ask ONE question to resolve ambiguity.

### Behavior rules
- Implement only the selected slice. If more work is needed:
  - stop and propose adding a new slice to the plan.
- Keep diffs small (target <= 150–250 LOC changed). If it grows, stop and split.
- Do not add new dependencies without approval.
- After implementation, update the plan doc:
  - Mark the slice as done (checkbox/status).
  - Add a short “Notes” line if a plan detail changed.

### Deliverables (always include)
1) **Changed files list**
2) **Diff summary** (what + why)
3) **Manual verification steps** (exact steps to try)
4) **Suggested commit message** (user will run git)

### Ending
- End with:
  - “Slice <N> implemented.”
  - “Plan updated at docs/plan/<slug>.md (or docs/refactor/<slug>.md).”
  - “Suggested commit: …”
