# Socratium Architecture
## Purpose
Socratium is a local-first reading companion that uses Socratic prompts and retrieval practice to make technical reading active. The long-term goal is provider-agnostic support (OpenAI-style and local servers); the current implementation uses Gemini.

## Principles
- Local-only, no accounts, no telemetry, no cloud services.
- Provider-agnostic; the frontend never stores API keys.
- Small, incremental changes; one feature at a time.
- Prefer simple, readable code over abstractions.
- Keep docs and the roadmap up to date with actual behavior.
- Full rewrite planned; no data migration required yet.
- Productization requires readable code with clear ownership and tests.

## MVP UX (Planned)
- Library: upload PDF, manage AI providers, and open a book.
- Reader: PDF in the center, outline on the left, chat panel on the right.
- Chat uses current page + outline context with Gemini responses.

## Product Phase (Phase 2) Goals
- Product-grade UI and reader experience (Ant Design).
- Better chat UX with persistent threads per book.
- OpenRouter provider support before generic base-url providers.
- Active provider remains global, switchable from any screen.
- Focus on understandability: smaller functions, clear flows, and reviewable steps.

## Current System
### Frontend
- React + Vite app in `frontend/`.
- UI rewrite in progress; current focus is layout and wiring core flows.

### Backend
- Fastify app built in `backend/src/app.ts`, started by `backend/src/server.ts`.
- SQLite schema in `backend/src/db/index.ts` (reset for rewrite).
- Book upload, outline extraction, chat, and provider configuration are wired.

### Backend Structure (Conventions)
- `routes/`: Fastify route plugins (request/response handling).
- `schemas/`: JSON schemas for request/response validation.
- `services/`: business logic and orchestration.
- `repositories/`: SQL queries and data access.
- `db/`: database connection and schema setup.
- `lib/`: shared utilities (paths, time, errors).
- `lib/limits.ts` holds common limit clamping helpers for debug endpoints.
- `app.ts` decorates `app.db`, `app.repos`, and `app.services` for consistent injection.
- `repositories/index.ts` and `services/index.ts` centralize dependency creation.

### Shared Types
- API request/response DTOs live in `shared/types/api.ts` and are imported with `import type`.
- Backend `tsconfig.json` sets `rootDir` to the repo root so shared types are included; build output goes to `dist/` at the repo root and backend start path is `dist/backend/src/server.js`.

### Backend Flow Summary (for new contributors)
- `server.ts` calls `buildApp()` and starts the Fastify server.
- `app.ts` initializes the DB, decorates `app.db`, `app.repos`, and `app.services`, registers plugins, error handlers, and routes.
- `routes/*` handle request/response, use `schemas/*` for validation, and call `app.services`.
- `services/*` contain business logic and call `app.repos`.
- `services/extraction.ts` handles PDF text extraction, outline capture, and page map persistence.
- `repositories/*` run SQL queries and return plain records.
- Shared API DTOs are imported from `shared/types/api.ts` using `import type`.

### Storage
- `backend/data/socratium.db`: SQLite database (rewrite schema).
- `backend/data/books/`: uploaded PDFs (ingest phase).
- `backend/data/ai_key`: local encryption key for stored API keys.
- `book.text_path` and `book.outline_json` reserved for extraction output.
- `page_map` table reserved for per-page text offsets.
- `ai_provider` table stores provider configs with encrypted API keys.

## Data Flow (Today)
1. Server start: `initDb()` creates tables for the rewrite schema.
2. `/api/books/upload` stores a PDF, extracts text/outline, and builds page map.
3. `/api/books` returns a list of uploaded books.
4. `/api/providers` manages Gemini providers; `/api/chat` uses the active provider.
5. Chat includes the current page plus the previous two pages of text as context.

## Sectioning Strategy (Current)
- Deferred; using outline + current page for context instead of precomputed sections.

## API Surface (Current)
- `GET /api/health`: server health check.
- `GET /api/books`: list uploaded books.
- `POST /api/books/upload`: upload a PDF and create a book record.
- `GET /api/books/:bookId`: metadata with `has_text`/`has_outline`.
- `GET /api/books/:bookId/file`: stream the original PDF for the reader.
- `GET /api/books/:bookId/outline`: return outline JSON for section context.
- `POST /api/chat`: return a Gemini chat reply with page context.
- `GET /api/providers`: list AI providers (Gemini for now).
- `POST /api/providers`: create a provider.
- `POST /api/providers/test`: test a Gemini API key + model.
- `PATCH /api/providers/:providerId/activate`: set active provider.
- `DELETE /api/providers/:providerId`: remove a provider.
- `GET /api/debug/books/:bookId/text`: return a text sample (debug).
- `GET /api/debug/books/:bookId/page-map`: return page-map offsets (debug).
- `GET /api/debug/books/:bookId/pages/:pageNumber/text`: return text for a page (debug).
## Debug Endpoints (Dev-Only)
- The `/api/debug/*` routes exist for local development and will not ship in production UI.

## AI Provider Handling (Current)
- Provider config stored locally in SQLite; API keys encrypted at rest.
- Gemini is supported via the `@google/genai` SDK.
- Provider configuration is managed from the Library UI modal.
- Phase 2 adds OpenRouter first; generic OpenAI-compatible providers follow later.

## Working Agreements for AI Agents
- Make one focused change at a time; confirm before big refactors.
- Keep code explicit and readable; add minimal comments only when needed.
- Avoid new frameworks, cloud services, auth, and analytics.
- Keep provider handling generic and backend-only for secrets.
- Prefer small PRs/steps with review and manual testing.
- Update `ARCHITECTURE.md` when behavior or flows change.
- Update `ROADMAP.md` when a task is completed or scope changes.

## Testing Habit (Process)
- After each completed task, include a short “How to test” checklist in the response.
- Prefer manual checks that map to the change (curl, UI action, or SQL query).
