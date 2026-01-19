# Socratium Architecture
## Purpose
Socratium is a local-first reading companion that uses Socratic prompts and retrieval practice to make technical reading active. It should work with any PDF and any OpenAI-style provider, including local servers.

## Principles
- Local-only, no accounts, no telemetry, no cloud services.
- Provider-agnostic; the frontend never stores API keys.
- Small, incremental changes; one feature at a time.
- Prefer simple, readable code over abstractions.
- Keep docs and the roadmap up to date with actual behavior.

## Current System
### Frontend
- Static HTML/CSS/JS in `frontend/`, served by the backend.
- Main layout: PDF viewer center, chat panel right.
- State lives in `frontend/app.js` with minimal client-side logic.
- Dialogs for provider config and PDF upload.

### Backend
- Fastify server in `backend/src/server.ts`, bound to `127.0.0.1`.
- Static files served from `frontend/`.
- SQLite via `better-sqlite3` in `backend/src/db.ts`.
- PDF ingestion in `backend/src/pdf.ts`.
- AI provider proxy in `backend/src/ai.ts`.

### Storage
- `backend/data/app.db`: SQLite database.
- `backend/data/books/*.pdf` and `backend/data/books/*.txt`: stored PDFs and extracted text.
- `backend/data/provider.key`: local encryption key for API keys.
- `backend/data/uploads/`: upload staging.

## Data Flow (Today)
1. Server start: `initDb()` creates tables; `ensureDefaultBook()` ingests a default PDF if present.
2. Frontend loads `/` and fetches `/api/books` and `/api/reading/:bookId`.
3. Selecting a page calls `/api/books/:bookId/pages/:pageNumber/section` and saves progress.
4. Chat actions call `/api/chat/intro`, `/api/chat/practice`, or `/api/chat/adhoc`.
5. User answers persist via `/api/chat/answer`.

## Sectioning Strategy (Current)
- Extract text per page and join with blank lines.
- Build a page map for offsets into the full text.
- Create sections in fixed page blocks (`PAGES_PER_SECTION = 4`).

## API Surface (Current)
- `GET /api/health`: server health check.
- `GET /api/provider`: provider config status (no key returned).
- `POST /api/provider`: save provider config and encrypted key.
- `POST /api/provider/test`: connectivity test call.
- `GET /api/books`: list books.
- `GET /api/books/:bookId`: book metadata.
- `GET /api/books/:bookId/pdf`: stream PDF.
- `POST /api/books/upload`: upload PDF and ingest.
- `GET /api/books/:bookId/sections`: sections for a book.
- `GET /api/sections/:sectionId`: single section.
- `GET /api/books/:bookId/pages/:pageNumber/section`: section for page.
- `GET /api/reading/:bookId`: reading progress (page + section).
- `POST /api/reading/:bookId`: update reading progress.
- `POST /api/chat/intro`: intro prompt for a section.
- `POST /api/chat/practice`: retrieval questions for a section.
- `POST /api/chat/adhoc`: answer a user question with section context.
- `POST /api/chat/answer`: store a user answer.

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
