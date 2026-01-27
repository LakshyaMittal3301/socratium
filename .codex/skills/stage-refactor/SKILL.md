---
name: stage-refactor
description: Create a refactor-only plan in docs/refactor (no behavior change). If asked to apply a specific refactor slice, implement only that slice and update the refactor plan.
---

## Stage: Refactor (plan-first, then apply)

### Goal
Help refactor a module for readability and understanding without changing behavior.

### Two modes
1) **Plan mode (default):** create/update `docs/refactor/<slug>.md` with refactor slices.
2) **Apply mode:** if the user says “apply slice N”, implement only that slice and update the doc.

### Behavior rules (both modes)
- No behavior changes. If behavior change seems necessary, stop and propose a separate feature plan.
- No new dependencies without approval.
- Keep diffs small; split if needed.
- Prefer mechanical, low-risk refactors:
  - rename for clarity
  - extract small pure helpers
  - move code to clearer files/folders
  - simplify types
  - reduce component responsibilities (React: logic into hooks)

### Plan mode output
Create/update: `docs/refactor/<slug>.md`
Use this template:

# Refactor Plan: <Title>

## Scope boundary
- In scope:
- Out of scope:

## Invariants (must not change)
- Behavior invariants:
- API invariants:

## Current pain points (brief)
- ...

## Target shape (what “better” looks like)
- ...

## Refactor slices
### Slice 1 — <name>
- [ ] Status: planned
- Files:
- Steps:
- Manual verification:
- Suggested commit message:

### Slice 2 — <name>
- ...

## Risks
- ...

### Ending (plan mode)
- State: “Refactor plan updated at docs/refactor/<slug>.md”
- Suggest next step: `$stage-refactor apply slice 1` (or `$stage-slice` against docs/refactor).

### Apply mode
- Read `docs/refactor/<slug>.md`
- Implement exactly Slice N.
- Update the checkbox/status for Slice N.
- Provide:
  - changed files
  - diff summary
  - manual verification
  - suggested commit message
