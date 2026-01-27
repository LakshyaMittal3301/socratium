---
name: stage-plan
description: Create or update an implementation plan with small slices in docs/plan, using docs/spec and docs/context when present; no production code edits.
---

## Stage: Plan (implementation slices)

### Goal
Produce a practical technical plan broken into small, commit-friendly slices.

### Behavior rules
- Do NOT modify production code in this stage.
- You MAY create/update docs only.
- Prefer using existing artifacts:
  - If `docs/spec/<slug>.md` exists, treat it as product intent.
  - If `docs/context/<slug>.md` exists, treat it as repo reality.
- Ask up to 1–3 clarifying questions only if the plan would be materially wrong without answers.

### Output
Create or update: `docs/plan/<slug>.md`
Slug inference same as other stages.

### Plan format (detailed but not fluffy)
Use this template:

# Plan: <Title>

## Summary
- What we are building/fixing in one paragraph max.

## Goals / Non-goals (brief)
- Goals:
- Non-goals:

## Approach (key decisions + rationale)
- Option chosen:
- Alternatives considered:
- Why:

## Slices (each slice should be small)
> Use checkboxes. Each slice MUST include: files, steps, manual verification, and a suggested commit message.

### Slice 1 — <name>
- [ ] Status: planned
- Files:
  - `...`
- Steps:
  1. ...
  2. ...
- Manual verification:
  1. ...
- Suggested commit message:
  - `...`

### Slice 2 — <name>
- [ ] Status: planned
- ...

## Risks / gotchas
- ...

## Rollback plan
- How to revert safely (e.g., revert commits, feature flag, etc.)

### Ending
- State: “Plan updated at docs/plan/<slug>.md”
- Suggest next step: `$stage-slice` (implement Slice 1).
