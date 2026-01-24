# Socratium Chat MVP Spec (Very Simple v0)

## Goal

Ship a **good-feeling** chat for a book reading companion with:

1. **User-created threads per book**
2. **Persistent chat history**
3. **Socratic, teacher-like responses** that are **adaptive** (guides by questions, explains when needed)
4. A simple, predictable context strategy (no caching, no summaries)

Non-goals (not in v0):

* excerpt caching / “don’t resend”
* rolling summaries
* embeddings / semantic retrieval
* misconception tracking / glossary
* complex token budgeting

---

## Concepts

### Thread

A user-created chat tied to a book. Users can create multiple threads per book.
Threads start untitled; after the first user message, set the title to the first sentence (or first ~8–12 words).
Each thread is bound to one provider/model; changing providers means starting a new thread.

### Message

A chat turn in a thread (user or assistant). Messages are persisted.

---

## Data Model (minimal)

### `threads`

* `id`
* `book_id`
* `title`
* `provider_id` (or `provider_type` + `model`)
* `created_at`, `updated_at`

### `messages`

* `id`
* `thread_id`
* `role`: `"user"` or `"assistant"`
* `content`
* `created_at`
* `meta` (optional JSON):

  * `page_number`
  * `section_name`
  * `context_text` (the excerpt sent for this turn)

That’s it.

---

## Context sent to the model (v0)

For each user message, send:

1. **System prompt** (fixed; below)
2. **Reading context block**

   * book title (optional)
   * current page number
   * section/subsection name
   * **book excerpt** (your current window: e.g., current page + previous 2 pages, or whatever you choose)
   * if excerpt missing: explicitly say the page was not extracted and the assistant should respond with best effort
3. **Last 8 messages** from this thread (raw)
4. **The user’s new message**

No other logic.

---

## Socratic behavior (product contract)

### Persona: Invisible Guide (default)

* Anchor to the excerpt: “In this paragraph…”, “The author is…”
* Avoid first-person opinions (“I think…”), avoid long lectures.
* The goal is to guide the reader to understanding.

### Adaptive approach

Default mode is **questions + hints**.

Switch to **micro-explanation** when:

1. The user explicitly asks to be told/explained, OR
2. The user gives a low-signal reply (very short non-answer).

No fixed keyword list; the model should detect intent.

### Micro-explanation style

When explaining:

* 3–5 sentences
* one core idea
* anchored to the excerpt
* then offer depth choices: intuition vs example vs formal detail (short line)
* end with one guiding question to return control to the user

---

## Prompts (copy/paste ready)

### 1) System prompt (fixed)

```text
You are Socratium, a reading companion. Act as an Invisible Guide anchored to the book excerpt and the user's current location.

Default: guide with targeted questions and small hints, pointing to the text, rather than giving direct answers.

Adaptive: if the user explicitly asks for an explanation (e.g., "just explain") OR gives a low-signal reply (e.g., "idk", non-engagement), provide a micro-explanation: 2–4 sentences, one core idea, anchored to the excerpt. Then offer a choice to go deeper (intuition vs example vs formal detail) and end with one guiding question.

Keep responses concise and grounded in the excerpt. Avoid first-person opinions and long lectures.
Aim for 3–5 sentences, one guiding question (two only if needed).
If the excerpt is missing, say so and answer with best effort.
```

### 2) Per-turn reading context block (backend-assembled)

Send this as a developer message (or a structured prefix before the user message):

```text
[READING_CONTEXT]
Book: {{book_title}}
Section/Subsection: {{section_name}}
Page: {{page_number}}
ExcerptStatus: {{available|missing}}

[BOOK_EXCERPT]
{{excerpt_text}}
```

---

## Backend flow (v0)

On each user message:

1. Persist the user message to the thread (auto-title thread if it is empty).
2. Load last 8 messages from this thread.
3. Fetch excerpt text using your current approach (e.g., current page + prev 2 pages).
4. Call the model with:

   * system prompt
   * reading context block (with excerpt)
   * last 8 messages
   * the new user message (already included in last 8 if you just saved it; either way is fine—just avoid duplicating it)
5. Persist assistant response as a message (including `context_text` in meta).

---

## Acceptance criteria (MVP)

1. Users can create multiple threads per book, switch between them, and all messages persist.
2. Thread titles auto-populate from the first user message and can be edited later.
3. Responses feel Socratic by default (questions + direction).
4. When the user asks for an explanation or gives a low-signal reply, the assistant switches to short explanation + depth options + a guiding question.
5. Assistant references the excerpt (“this paragraph…”) instead of generic answers.

---

## Two simple knobs (optional)

* `RECENT_MESSAGES_COUNT = 8`
* `EXCERPT_WINDOW = current page (+ optional previous pages)` (code-configured, not user-configured)

## UI/UX Behavior (v0)
- Chat input is disabled when no active provider is selected.
- Chat input is disabled when the active provider does not match the thread's provider.
- “Regenerate” is deferred.

## Implementation Plan (Step-by-step)
1. **DB**: add `threads` + `messages` tables; add provider linkage to threads.
2. **Backend APIs**:
   - Threads: list/create/update title/delete for a book.
   - Messages: list by thread; send message to `/api/chat` with threadId.
3. **Service flow**:
   - Persist user message, build context, call provider, persist assistant message.
   - Store `context_text` in message meta.
4. **Prompt assembly**:
   - System prompt + reading context block + last N messages + new user message.
   - Add `ExcerptStatus` when text missing.
5. **Frontend UI**:
   - Thread list per book (select/create/rename/delete).
   - Chat panel uses selected thread; disable input when no active provider.
6. **Manual checks**:
   - Create thread, send message, refresh: history persists.
   - Switch threads: context and history isolate correctly.
   - Remove active provider: input disabled + warning shown.
