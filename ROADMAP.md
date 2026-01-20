# Roadmap

## Direction
- Full rewrite is approved; no data migration required.
- Make the reader generic across PDFs (no bundled book required).
- Keep the provider layer interchangeable and backend-only for secrets.
- Improve sectioning beyond fixed page blocks.
- Build a collapsible TOC tree and TOC-based sectioning (with sub-heading splits).
- Clarify and simplify backend flows and naming.
- Tighten the reading + chat UX based on actual usage.
- Add minimal tests around sectioning and provider configuration.

## Next
- Refactor backend structure and flow before starting Phase 2b/2c.
- Phase 2b: PDF text extraction + page map storage.
- Phase 2c: Outline/TOC extraction stub + persist outline JSON.

## Plan
- Phase 1: Backend skeleton with clean module layout, SQLite schema reset, health route.
- Phase 2: PDF ingest pipeline (upload, storage, text extraction, page map).
- Phase 3: TOC extraction + sectioning from headings, with split logic and tree data.
- Phase 4: Sections API + reading status endpoints (intro_done, completed).
- Phase 5: React UI shell (layout + routing + PDF viewer stub).
- Phase 6: TOC tree UI wired to sections API.
- Phase 7: Intro prompt flow (backend prompt + chat UI).
- Phase 8: Discuss flow (3 retrieval questions, answer capture).
- Phase 9: Reading progress + completion UX polish.
- Phase 10: Cleanup, tests, and docs update pass.

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
