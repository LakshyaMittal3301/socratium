# Socratium

Socratium is a local-first reading companion that uses Socratic prompts and retrieval practice to make technical reading active. It runs entirely on your machine and currently supports Gemini via the backend.

## Quickstart (Development)
1. `cd backend`
2. `npm install`
3. `npm run dev`
4. In another terminal: `cd frontend && npm install && npm run dev`

The backend runs on `http://127.0.0.1:8787`. The React dev server runs on `http://127.0.0.1:5173`.

## Debug Endpoints (Dev Only)
- Backend debug routes are available only when `DEBUG_ENDPOINTS=true`.
- Frontend debug panel is visible only when `VITE_DEBUG=true`.

## Status
The app is in a full rewrite. Upload → reader → chat is wired, with AI provider configuration in the library screen.

## Productization (Phase 2)
The next phase focuses on product-grade UX and a more understandable codebase.
We will:
- adopt Ant Design for UI consistency,
- add OpenRouter support (generic providers later),
- improve reader UX, then chat UX iteratively,
- keep API keys backend-only and encrypted at rest,
- take small, reviewable steps with manual tests.

## Repo Layout
- `backend/`: Fastify + TypeScript API server.
- `frontend/`: React + Vite UI.

## Local Data
- `backend/data/socratium.db`: SQLite database.
- `backend/data/ai_key`: local encryption key for stored API keys.

To reset local state, remove `backend/data/`.

## Environment
- Requires Node 18+ (for `fetch`).
- Set `PORT` to change the default port (8787).
