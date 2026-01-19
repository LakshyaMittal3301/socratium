# Socratium MVP Specification

## Overview
Socratium is a local-first reading companion that uses Socratic dialogue to make technical reading more active. It pauses readers at logical sections, prompts reflection, and uses retrieval practice questions to reinforce understanding.

Primary user: a motivated reader of technical books who wants guided comprehension checks without leaving the reading flow.

## Goals (MVP)
- Keep the reader in a single, focused workspace: PDF in the center, AI chat on the right.
- Turn each section into a short problem prompt before reading and retrieval practice after reading.
- Support bring-your-own AI provider using OpenAI-style APIs (including local OpenAI-compatible servers).
- Maintain local-only data handling and storage.

## Non-Goals (Explicit)
- No user accounts, authentication, or cloud sync.
- No payments, subscriptions, or hosted backend.
- No analytics, telemetry, or third-party tracking.
- No multi-book library management beyond a single, bundled book.

## Core User Journey (MVP)
1. User opens the app.
2. User configures AI provider (base URL, API key, model name).
3. User opens the only available book: Designing Data-Intensive Applications (PDF).
4. The reader shows the PDF in the center; the right sidebar hosts the AI chat.
5. The AI identifies the next logical section and presents a short framing question or problem.
6. User types their initial thoughts in the chat.
7. User reads the section in the PDF viewer.
8. The AI asks retrieval practice questions based on the section.
9. User answers; the AI acknowledges and, if needed, asks follow-ups.
10. User continues to the next section and repeats.

## UX and Interaction Model
### Reading and Context Awareness
- The reader is the primary focus; AI support stays on the right to preserve flow.
- The AI uses the visible page/section as the default context for prompts and questions.
- The UX is inspired by youlearn.ai: central reader with side tooling that tracks reading progress.

### Section Introduction
- Before a section, the AI provides a short, concrete prompt that frames the idea as a problem or question.
- The user can respond with their current understanding before reading.

### Retrieval Practice
- After a section, the AI asks 2-4 questions that require recall, not recognition.
- Questions should vary in form (definition, application, compare/contrast).
- The AI asks follow-up questions only if the user's answer is incomplete.

### Detecting Answer Completion
Two signals are supported; the UX should not guess completion silently:
- Explicit: user clicks a "Done" or "Submit answer" control.
- Conversational: user types "done" or "final" and the AI confirms closure.
The AI should acknowledge completion with a brief check-in (e.g., "Got it. Ready for the next section?").

### Ad-hoc Questions While Reading
- The user can ask "side questions" at any time; the AI uses the current section context.
- The AI should label when it is answering a side question versus a section prompt.

## Content and Sectioning Strategy
### Possible Approaches
1. Fixed chunking
   - Split text by a fixed token/character count with overlap.
   - Pros: easy, predictable.
   - Cons: often breaks concepts mid-thought.
2. Structure-aware chunking
   - Use the PDF table of contents, headings, and page breaks.
   - Pros: aligns with author intent.
   - Cons: requires reliable PDF structure extraction.
3. Semantic chunking
   - Use embeddings or LLM-guided segmentation to group related paragraphs.
   - Pros: conceptually coherent sections.
   - Cons: more compute; can be less transparent.
4. Hybrid approach
   - Start with structure-aware boundaries, then refine with semantic checks.
   - Pros: balanced coherence and predictability.
   - Cons: slightly more complexity.

### Final Spec Decision
Use a hybrid approach:
- Primary boundaries come from the PDF table of contents and heading detection.
- If a section is too long, split it into smaller semantic sub-sections using LLM-guided hints.
- Apply small overlaps between adjacent sections to preserve continuity.

## Context Gathering and Retrieval (RAG)
### Possible Approaches
1. No retrieval (current page only)
   - Simpler but misses broader context.
2. Shallow retrieval (current section + adjacent sections)
   - Good balance of relevance and simplicity.
3. Full RAG with embeddings
   - Vector search across the whole book plus notes.
   - More accurate but heavier to implement.

### Final Spec Decision
Start with shallow retrieval:
- Use the current section as the primary context.
- Include the immediately previous and next section as optional context.
- Add embeddings-based retrieval only if shallow context is insufficient for quality.

## Chunking and Prompt Assembly
- Chunk size should target short, digestible sections (e.g., 2-6 pages or ~500-1200 tokens).
- Use overlap to reduce cliff effects between sections.
- Context in prompts should prioritize: current section, user's initial response, and prior section summary.

## AI Provider Connectivity
### Supported Provider Model
- OpenAI-style API contract for both remote providers and local OpenAI-compatible servers.
- User provides: base URL, API key, and model name.
- The backend stores credentials locally and proxies all calls; the frontend never holds keys.

### Reliability Expectations
- Retry once on transient errors.
- Provide clear user-facing errors for invalid keys or unreachable servers.

## Data and State (Local-Only)
- Store: provider config, reading progress, section metadata, chat history, and user answers.
- Keep storage local; no cloud sync in MVP.

## Key Screens / States
- Provider setup: connection details and validation.
- Reading workspace: PDF reader in center, AI chat on right.
- Section transition: AI introduces the next section.
- Retrieval practice: Q/A flow after section completion.
- Error states: provider failure, PDF parsing failure.

## Success Criteria (MVP)
- Users can read DDIA with uninterrupted context.
- The AI reliably introduces each section and asks retrieval questions.
- The chat experience stays aligned to what the user is currently reading.
- The app stays local-only and provider-agnostic.

## Open Questions
- What is the minimum acceptable quality of PDF structure extraction for DDIA?
- Should initial section summaries be generated or left blank for MVP?
- How many retrieval questions feel effective without being fatiguing?

---

## System Design (MVP)
This section translates the product spec into a concrete, minimal system design that stays local-only and provider-agnostic.

### High-Level Architecture
- Frontend: single-page web UI with a PDF reader centered and AI chat on the right.
- Backend: Fastify (TypeScript) API server running on localhost only.
- Storage: local database (SQLite) plus local file storage for PDFs and derived text.
- AI providers: OpenAI-style API interface, used via backend proxy.

### Core Data Flow
1. On first run, the backend loads the bundled PDF and extracts text.
2. The backend builds section boundaries and stores section metadata.
3. The frontend requests sections and reading state.
4. The user reads and interacts with the chat; the backend gathers context and calls the chosen AI provider.
5. User answers and progress are stored locally.

### Data Storage
Local-only, no cloud sync.
- SQLite DB for structured metadata and chat history.
- File storage for:
  - Original PDF.
  - Extracted plain text.
  - Section index JSON (optional cache).

### Database Models (SQLite)
All timestamps are local time in ISO-8601.

1. ProviderConfig
- id (text, primary key)
- name (text) - display label
- base_url (text)
- api_key_enc (text) - encrypted at rest
- model (text)
- created_at (text)
- updated_at (text)

2. Book
- id (text, primary key) - e.g., "ddia"
- title (text)
- author (text)
- pdf_path (text)
- text_path (text)
- created_at (text)

3. Section
- id (text, primary key)
- book_id (text, foreign key)
- title (text)
- order_index (integer)
- start_page (integer)
- end_page (integer)
- start_offset (integer) - byte or char offset into extracted text
- end_offset (integer)
- summary (text, nullable)
- created_at (text)

4. PageMap
- id (text, primary key)
- book_id (text, foreign key)
- page_number (integer)
- start_offset (integer)
- end_offset (integer)

5. ReadingProgress
- id (text, primary key)
- book_id (text, foreign key)
- current_section_id (text, foreign key)
- current_page (integer)
- last_seen_at (text)

6. ChatMessage
- id (text, primary key)
- book_id (text, foreign key)
- section_id (text, foreign key, nullable)
- role (text) - "user" | "assistant" | "system"
- message (text)
- message_type (text) - "intro" | "practice" | "adhoc" | "feedback"
- created_at (text)

7. UserAnswer
- id (text, primary key)
- section_id (text, foreign key)
- question (text)
- answer (text)
- is_complete (integer) - 0/1
- created_at (text)

### API Endpoints (HTTP/JSON)
Base: `http://localhost:<port>/api`

Health
- `GET /health` -> { status: "ok" }

Provider Configuration
- `GET /provider` -> current provider config (redacted key)
- `POST /provider` -> set/update provider config
  - body: { name, baseUrl, apiKey, model }
  - response: { ok: true }
- `POST /provider/test` -> validate provider connectivity

Books and Sections
- `GET /books` -> list available books (MVP: single item)
- `GET /books/:bookId` -> book metadata
- `GET /books/:bookId/sections` -> list sections with page ranges
- `GET /sections/:sectionId` -> section metadata and optional summary
- `GET /books/:bookId/pages/:pageNumber/section` -> section id for a page

Reading State
- `GET /reading/:bookId` -> current progress
- `POST /reading/:bookId` -> update progress
  - body: { currentPage, currentSectionId }

Chat and Practice
- `POST /chat/intro` -> AI introduces next section
  - body: { sectionId, userPrompt? }
- `POST /chat/practice` -> AI generates retrieval questions
  - body: { sectionId, userAnswer? }
- `POST /chat/adhoc` -> answer user question with current context
  - body: { sectionId, question }
- `POST /chat/answer` -> store user answer and mark completion
  - body: { sectionId, question, answer, isComplete }

Errors
- Standard error response: { error: { code, message } }

### Sectioning and Parsing Pipeline
- PDF text extraction into a single text file.
- PageMap built by aligning PDF page boundaries to text offsets.
- Section boundaries derived from table of contents and headings.
- If a section exceeds the target size, the backend asks the AI to suggest safe split points using headings and paragraph breaks.
- Section metadata saved in DB; optional cached JSON for quick reloads.

### Context Selection and Prompt Assembly
Default context for AI calls:
1. Current section text.
2. User's pre-reading response for that section (if any).
3. Previous section summary (if available).
4. Adjacent section excerpts (optional, short).

### Completion Detection (UX + Backend)
- Frontend can send explicit completion via `isComplete=true`.
- Backend stores completion state on `UserAnswer`.
- If user uses conversational completion (e.g., "done"), frontend still sends explicit completion.

### Security and Privacy
- API keys stored locally and encrypted.
- Backend only listens on localhost.
- No telemetry or external analytics.

### Reliability and Limits
- Provider errors surfaced with actionable messaging.
- One retry on transient failures.
- Token limits enforced by truncating context and summarizing older chat.

### Minimal Frontend Responsibilities
- Render PDF and track current page.
- Show chat threads per section.
- Persist reading progress via API.
- Provide explicit "Done" for answers.
