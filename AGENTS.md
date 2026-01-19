# AGENTS.md

## Project
**Name:** Socratium

**Description:**  
Socratium is a local-first reading companion that uses the Socratic method to discuss what you read.

The goal is to make reading technical books more active by pausing at logical sections, discussing them with AI, and asking questions that test understanding.

---

## Repo structure
This is a single repo containing both frontend and backend:

- `frontend/` — browser-based UI
- `backend/` — local-only API server

Both are developed and run locally.

---

## Backend
- Node.js
- Fastify
- TypeScript
- Runs only on localhost

Responsibilities:
- Store AI configuration locally
- Call AI models (API-based or local OpenAI-compatible servers)
- Handle book text processing and discussion logic

---

## Frontend
- Browser-based UI
- Communicates with backend over localhost
- Users may enter API keys via the frontend
- API keys must be stored and used by the backend (not embedded in frontend logic)

---

## AI / LLM usage
- Users bring their own AI provider
- Support OpenAI-style APIs and OpenAI-compatible local servers
- Do not hardcode a specific provider
- Treat the model layer as interchangeable

---

## Scope rules (important)
Do NOT add the following unless explicitly asked:
- User accounts or authentication
- Payments or subscriptions
- Cloud services or hosted backends
- Telemetry or analytics
- Heavy frameworks (NestJS, Next.js, etc.)

Keep the MVP small and focused.

---

## Development principles
- Prefer simple, readable and clean solutions
- Make small, incremental changes
- Avoid over-engineering
- Follow best practices
- Write minimal test cases, wherever applicable
