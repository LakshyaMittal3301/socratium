# Socratium

Socratium is a local-first reading companion that uses Socratic prompts and retrieval practice to make technical reading active. It is provider-agnostic and runs entirely on your machine.

## Quickstart
1. `cd backend`
2. `npm install`
3. `npm run dev`
4. Open `http://127.0.0.1:8787`

The frontend is served by the backend; there is no separate frontend dev server.

## Configure an AI Provider
- Click the Provider button in the UI.
- Enter base URL, model, and API key.
- Keys are stored locally by the backend (encrypted at rest).

## Upload a Book
- Click Upload in the UI and select a PDF.
- PDFs and extracted text are stored under `backend/data/books/`.
- The DDIA PDF is treated as local-only and is not committed to git.

## Repo Layout
- `backend/`: Fastify + TypeScript API server.
- `frontend/`: Static HTML/CSS/JS UI.

## Local Data
- `backend/data/app.db`: SQLite database.
- `backend/data/provider.key`: local key used to encrypt API keys.
- `backend/data/books/`: PDFs and extracted text.

To reset local state, remove `backend/data/`.

## Environment
- Requires Node 18+ (for `fetch`).
- Set `PORT` to change the default port (8787).
