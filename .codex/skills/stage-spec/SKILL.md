---
name: stage-spec
description: Create or update a lightweight product/feature spec in docs/spec for the current work item; ask up to 3 questions; do not change production code.
---

## Stage: Spec (lightweight PRD)

### Goal
Turn a fuzzy idea into a short, readable spec that the human can approve and edit.

### Behavior rules
- Do NOT modify production code in this stage.
- You MAY create/update docs only.
- Ask up to 1–3 clarifying questions if needed, then proceed with sensible defaults.

### Output
Create or update: `docs/spec/<slug>.md`

If the user did not provide a slug, infer it from the request:
- Lowercase, kebab-case, 2–6 words.
- Examples: `pdf-zoom-flicker`, `frontend-refactor-phase-1`, `chatbot-ux-pass`.

### Spec template (keep it tight; bullets > paragraphs)
Use these sections:

# <Title>

## Goal
- ...

## User scenario
- ...

## Current behavior
- ...

## Proposed behavior
- ...

## Non-goals
- ...

## Acceptance criteria
- [ ] ...
- [ ] ...

## Open questions (if any)
- ...

### Ending
- End by stating: “Spec updated at docs/spec/<slug>.md”
- Suggest next step: `$stage-research` (if codebase discovery is needed) or `$stage-plan`.
