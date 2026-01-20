# Roadmap

## Direction
- Full rewrite is approved; no data migration required.
- Make the reader generic across PDFs (no bundled book required).
- Keep the provider layer interchangeable and backend-only for secrets.
- Keep sectioning deferred; use outline + current page for context in MVP.
- Clarify and simplify backend flows and naming.
- Tighten the reading + chat UX based on actual usage.
- Add minimal tests around extraction and provider configuration.

## Next
- Build MVP reader: library -> reader -> chat with page-aware context.

## Plan
- Phase 1: Backend skeleton with clean module layout, SQLite schema reset, health route.
- Phase 2: PDF ingest pipeline (upload, storage, text extraction, page map).
- Phase 3: Reader shell (PDF center + chat panel + current section header).
- Phase 4: React-PDF rendering + page tracking.
- Phase 5: Outline mapping to current page.
- Phase 6: Chat MVP stub + API.
- Phase 7: AI integration + prompt refinement.
- Phase 8: Cleanup, tests, and docs update pass.

## Done
- Added a root `.gitignore` for local data, dependencies, and PDFs.
- Added `README.md` for setup and usage.
- Replaced `SPEC.md` with `ARCHITECTURE.md` for current system context.
- Added `ROADMAP.md` to track direction and completed work.
- Added `@shared/*` TypeScript alias and a sample shared type.
- Rebuilt backend skeleton with a fresh schema and health route.
- Added basic book storage and PDF upload/list endpoints.
- Refactored routes to use Fastify decorate services and shared API DTOs.
- Swapped PDF parsing to `pdfjs-dist` and added schema fields for text/outline/page map.
- Implemented PDF extraction, page map storage, and debug endpoints.
- Refactored extraction flow into a dedicated service with repo helpers.
- Added debug endpoint and UI for page map and per-page text sampling.
- Added chat stub API and UI with page context excerpt.
