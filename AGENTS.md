# AGENTS.md
# Purpose: Make Codex behave like a thoughtful pair programmer for a small TypeScript fullstack project.

## Working agreements (priority order)
- Optimize for learning: explain changes clearly, keep code readable, and prefer simple designs.
- Keep changes small and reviewable:
  - Default target: <= 150–250 LOC changed per slice.
  - If a change grows beyond that, stop and propose how to split it.
- Ask questions when needed, but keep it lightweight:
  - Ask up to 1–3 clarifying questions, then propose a default and proceed.
- Do not add new dependencies unless I explicitly approve.

## Workflow & artifacts (write/update these files automatically when relevant)
- Product spec (optional, lightweight): `docs/spec/<slug>.md`
- Feature-scoped repo map / research: `docs/context/<slug>.md`
- Implementation plan (sliced): `docs/plan/<slug>.md`
- Refactor plan (sliced): `docs/refactor/<slug>.md`
- Keep docs concise. Prefer bullets over essays.

## Slices & commits
- We commit per slice. I will run git commands, but you should suggest a commit message when helpful.
- Each slice should include:
  - What changed (brief)
  - Why (brief)
  - Manual verification steps (exact steps I can do)

## Coding style (TypeScript/React/Fastify oriented, but keep generic)
- Prefer clarity over cleverness. Avoid over-engineering.
- Use explicit names and small functions.
- Favor “functional core / imperative shell”:
  - Keep side effects at the edges (handlers, IO).
  - Keep logic in small, testable/pure helpers where practical.
- React:
  - Keep components focused; move non-UI logic to hooks/helpers.
  - Avoid unnecessary re-renders (memoization only when it clearly helps).
- Backend:
  - Keep request handlers thin; isolate business logic.
  - Prefer consistent error handling patterns already used in the repo.

## Tooling
- I prefer manual verification over writing tests/linters for this side project.
- When suggesting commands, inspect package.json for existing scripts and use those.
- Do not run heavy commands unless asked (or clearly necessary to validate correctness).
