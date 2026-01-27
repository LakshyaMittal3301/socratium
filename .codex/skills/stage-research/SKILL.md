---
name: stage-research
description: Do feature-scoped repo research and write a concise repo map to docs/context; ask up to 3 questions; no production code edits.
---

## Stage: Research (feature-scoped repo map)

### Goal
Create a small, practical map of the code relevant to THIS work item (not a whole-repo summary).

### Behavior rules
- Do NOT modify production code in this stage.
- You MAY create/update docs only.
- Keep this scoped to the current feature/refactor area.
- Ask up to 1–3 clarifying questions if needed (e.g., where flicker occurs, desired zoom UX).
- If the user has a specific file open/selected in the IDE, start there.

### Output
Create or update: `docs/context/<slug>.md`

If slug not provided, infer it the same way as stage-spec.

### What to include (bullets; 0.5–1 page)
Use this template:

# Context Map: <Title>

## Relevant files/modules (3–10)
- `path/to/file.ts` — why it matters
- ...

## Current flow (today)
- Entry points:
  - ...
- Key functions/components:
  - ...
- Data/state ownership:
  - ...
- Rendering/IO boundaries (where side effects happen):
  - ...

## Existing conventions/patterns to follow
- Folder structure:
- Naming:
- Error handling:
- State management approach:

## Invariants / must-not-break
- ...

## Suspected root causes / risk areas (if debugging)
- ...

## Questions / unknowns
- ...

### Ending
- State: “Context map updated at docs/context/<slug>.md”
- Suggest next step: `$stage-plan`.
