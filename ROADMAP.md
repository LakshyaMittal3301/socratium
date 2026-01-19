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
