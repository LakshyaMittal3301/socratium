# AGENTS.md — Socratium

## Project
Socratium is a **local-first reading companion** that uses the Socratic method to discuss what you read.

## Repo map
- `frontend/` — browser UI
- `backend/` — localhost API (Fastify + TypeScript)
Frontend talks to backend over localhost.

## Planning docs (source of truth)
We plan work using templates:
- `docs/prd/TEMPLATE.md` (PRD: what/why, success criteria, non-goals)
- `docs/spec/TEMPLATE.md` (Spec: how, checklist, verification)

Docs are gated: **DRAFT → human approves → FINAL**.

## Workflow (gated, repeatable)
1) **PRD (DRAFT)**: ask clarifying questions (≤8), draft PRD, then stop for human approval → **PRD (FINAL)**  
2) **Spec (DRAFT)**: draft spec + small checklist, then stop for human approval → **Spec (FINAL)**  
3) **Slice loop (repeat per checklist item)**:
   - Build: implement **one** checklist item only
   - AI Review: `/review` then summarize (tiny)
   - AI Fix: fix **only P0/P1** from the summary (local refactors OK if needed for clarity/correctness)
   - Human Review: human reviews `/diff`
   - Merge
4) After all slices: start a new PRD for the next feature.

## Do / Don’t
**Do**
- Keep changes small, boring, and easy to understand.
- Prefer clarity over cleverness; improve code toward simplicity.
- Stop early if scope expands.

**Don’t**
- Add new features, abstractions, or refactors beyond the current slice.
- Add/remove dependencies without asking.
- Copy existing patterns blindly if they reduce clarity.

## Build limits (stop and ask)
Stop and ask before proceeding if:
- > ~250 lines changed OR > ~8 files touched
- Spec/intent is unclear
- Work requires refactoring unrelated code
- A “bigger cleanup” is desired → propose as a new checklist item instead

## Review output (must be tiny)
When summarizing review:
- Max **5 bullets**
- Each bullet: **P0/P1/P2**, file (and line if easy), one-line fix
- No essays, no new features

## Commands & checks
Use existing project scripts only. Prefer targeted checks.
Examples (adjust to actual scripts present):
- Frontend: `cd frontend && npm test` / `npm run lint` / `npm run typecheck`
- Backend: `cd backend && npm test` / `npm run lint` / `npm run typecheck`
If no automated checks exist, provide a short manual verification checklist.

## Must ask before
- Installing/removing dependencies
- Large refactors or moving/renaming many files
- Breaking API/contract changes
- Changing build/CI/deploy config

## Security (non-negotiable)
- API keys are entered in the frontend UI but must be stored/used by the **backend**.
- Never embed or leak keys in frontend code, logs, errors, or client storage.
- Treat user content and keys as local-only data.
