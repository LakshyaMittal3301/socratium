# Roadmap

## Direction
- Full rewrite is approved; no data migration required yet.
- Build a product-grade UX with a clean, understandable codebase.
- Make the reader generic across PDFs (no bundled book required).
- Keep the provider layer interchangeable and backend-only for secrets.
- Keep sectioning deferred; use outline + current page for context in MVP.
- Clarify and simplify backend flows and naming.
- Tighten the reading + chat UX based on actual usage.
- Add minimal tests around extraction and provider configuration.

## Next
- Finalize chat panel (Ant Design X) and add reader controls.

## Plan
### Phase 1 (Complete): MVP Rewrite
- Backend skeleton with clean module layout, SQLite schema reset, health route.
- PDF ingest pipeline (upload, storage, text extraction, page map).
- Reader shell (PDF + chat panel).
- React-PDF rendering + page tracking.
- Outline mapping to current page for section detection (UI hidden).
- Chat UI + page context.
- Gemini integration + provider settings UI.
- Reader UX polish (ongoing in Phase 2).
- Cleanup, tests, and docs update pass.

### Phase 2 (Now): Productization Plan
Core goal: product-grade UX + simpler, more understandable codebase.

1) Foundation and code quality
- Remove destructive schema resets; add migrations or safe schema versioning.
- Simplify service/repo flows with clear naming and small functions.
- Strengthen provider abstraction while keeping secrets backend-only.
- Add minimal tests around extraction + provider configuration.

2) Provider work (OpenRouter first)
- Add OpenRouter provider type and end-to-end support.
- Keep active provider global (switchable from a modal accessible on all screens).
- Document the provider model clearly in `ARCHITECTURE.md`.
- Add a short comparison workflow for evaluating model quality.

3) UI overhaul (Ant Design)
- Introduce Ant Design components and layout tokens.
- Rebuild Library + Reader shell with consistent navigation and spacing.
- Keep UX focused: fast, readable, minimal clutter.

4) Reader-first iteration cycle
- Reader pass: navigation clarity, outline jump, last-read position.
- Chat pass: thread list per book, message formatting, prompt tuning v1.
- Repeat: reader pass, then chat pass, until UX feels product-ready.

5) Non-core improvements (end or opportunistic)
- Rename/delete book, rename/delete chat thread.
- Small UX quality-of-life improvements that don't disrupt the core flow.

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
- Added React-PDF reader with page tracking and section title updates.
- Added outline sidebar with current section highlight.
- Added chat UI with page context excerpt.
- Added AI provider configuration and chat integration with page context.
- Added OpenRouter provider support with a model list endpoint.
- Enforced single active provider + updated `updated_at` on activation.
- Moved provider DTOs into `shared/types/providers.ts` for clarity.
- Refactored provider and chat services with provider adapters and clearer helpers.
- Refactored book flow to separate extraction, storage, and debug routes.
- Added Ant Design layout shell (AppShell) and theme tokens.
- Split frontend styles into layout/pages/components for clarity.
- Library page rebuilt with card grid + PDF thumbnails.
- Reader page rebuilt as a 2-column layout (PDF + chat).
- Chat panel rebuilt with Ant Design X (`Bubble.List`, `Sender`) and `x-markdown`.
- AI settings modal rebuilt with provider form + provider list.
