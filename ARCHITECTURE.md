# Socratium Architecture
## Purpose
Socratium is a local-first reading companion that uses Socratic prompts and retrieval practice to make technical reading active. It should work with any PDF and any OpenAI-style provider, including local servers.

## Principles
- Local-only, no accounts, no telemetry, no cloud services.
- Provider-agnostic; the frontend never stores API keys.
- Small, incremental changes; one feature at a time.
- Prefer simple, readable code over abstractions.
- Keep docs and the roadmap up to date with actual behavior.
- Full rewrite planned; no data migration required.

## Target UX (Planned)
- Collapsible table-of-contents tree on the left.
- Clean PDF reader centered.
- Chat panel on the right with two modes: intro and discuss.
- Selecting a section shows a short, problem-framing intro question.
- User can skip or chat briefly, then mark the intro done.
- After reading, user clicks discuss and answers 3 retrieval questions.
- Completed sections stay accessible with no gating.

## Target Sectioning (Planned)
- Use PDF outline/TOC for primary section boundaries.
- If a section spans too long, split by sub-headings; titles reflect logical headings.
- Target 4-6 pages per section while respecting author structure.
- Keep the sectioning pipeline extensible for future algorithms and user-defined sections.

## Current System
### Frontend
- React + Vite app in `frontend/`.
- UI rewrite in progress; current focus is layout and wiring core flows.

### Backend
- Fastify app built in `backend/src/app.ts`, started by `backend/src/server.ts`.
- SQLite schema in `backend/src/db.ts` (reset for rewrite).
- Only `/api/health` is wired in phase 1.

### Storage
- `backend/data/socratium.db`: SQLite database (rewrite schema).
- Additional file storage (PDFs, extracted text, uploads) will be added in the ingest phase.

## Data Flow (Today)
1. Server start: `initDb()` creates tables for the rewrite schema.
2. `/api/health` returns a basic status check.

## Sectioning Strategy (Current)
- Not implemented in the rewrite yet; TOC-based sectioning is planned.

## API Surface (Current)
- `GET /api/health`: server health check.

## AI Provider Handling
- Provider config stored locally; API keys encrypted with AES-256-GCM.
- `provider_type = openai`: POST to `.../v1/chat/completions` (OpenAI-compatible).
- `provider_type = gemini`: POST to `.../models/{model}:generateContent`.

## Working Agreements for AI Agents
- Make one focused change at a time; confirm before big refactors.
- Keep code explicit and readable; add minimal comments only when needed.
- Avoid new frameworks, cloud services, auth, and analytics.
- Keep provider handling generic and backend-only for secrets.
- Update `ARCHITECTURE.md` when behavior or flows change.
- Update `ROADMAP.md` when a task is completed or scope changes.
