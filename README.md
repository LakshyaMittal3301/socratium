# Socratium

Socratium is a local-first reading companion that uses Socratic prompts and retrieval practice to make technical reading active. It is provider-agnostic and runs entirely on your machine.

## Quickstart (Development)
1. `cd backend`
2. `npm install`
3. `npm run dev`
4. In another terminal: `cd frontend && npm install && npm run dev`

The backend runs on `http://127.0.0.1:8787`. The React dev server runs on `http://127.0.0.1:5173`.

## Status
The app is in a full rewrite. Only `/api/health` is wired on the backend; UI and feature flows are being rebuilt.

## Repo Layout
- `backend/`: Fastify + TypeScript API server.
- `frontend/`: React + Vite UI.

## Local Data
- `backend/data/socratium.db`: SQLite database.

To reset local state, remove `backend/data/`.

## Environment
- Requires Node 18+ (for `fetch`).
- Set `PORT` to change the default port (8787).
