# Socratium UI Overhaul Plan (Phase 2)

## Goals
- Product-grade UI with Ant Design components.
- Warm paper-like visual tone, compact density.
- Persistent left navigation; Reader is primary focus.
- Reader + Chat share a single page with a 3-column layout.
- Easy to extend for future features (outline actions, backlinks, threads).

## IA and Navigation
- Left nav (persistent):
  - Library
  - Reader
  - Settings
- Reader page uses a 2-column layout: PDF (center/left, dominant) + chat (right).
- Chat is not a separate page; it lives inside Reader.

## Visual System
- Tone: warm paper, calm and academic.
- Density: compact (Notion-like).
- Typography:
  - UI: Manrope (or similar modern sans).
  - Reading: Source Serif 4 (or similar serif for long-form).
- Colors (initial direction):
  - Background: warm off-white.
  - Surface: slightly lighter/raised cards.
  - Text: deep charcoal.
  - Accent: muted teal or warm copper.

## Layout Structure
- AppShell:
  - Ant Design `Layout` with `Sider` + `Header` + `Content`.
  - `Sider` shows nav + compact app branding.
  - `Header` shows page title and context actions.
- Reader page:
  - 2-column layout within `Content`.
  - Left: PDF viewer (dominant).
  - Right: chat panel (scrollable).
  - No in-page reader header.
  - PDF has a paper-like frame and subtle shadow.

## Component Plan (Ant Design)
- Layout: `Layout`, `Sider`, `Menu`, `Header`, `Content`.
- Library:
  - Upload: `Upload`, `Button`.
  - Book list: `List` or `Table` with compact rows.
  - Provider settings: `Modal`, `Form`, `Select`.
- Reader:
  - Outline: `Tree` or custom `List`.
  - Chat: placeholder container; `@ant-design/pro-chat` later.
- Settings:
  - Provider management section and future preferences.

## Implementation Steps
1) Base layout
   - Add Ant Design setup + theme tokens.
   - Build AppShell with persistent nav.
   - Create empty pages (Library, Reader, Settings).
2) Library page
   - Upload block + book list with compact rows.
   - Provider modal integrated with Ant Design components.
3) Reader page
   - 3-column layout; center PDF viewer dominates.
   - Outline on left, chat on right (static shell).
4) Settings page
   - Provider config summary + placeholders for future preferences.
5) Chat enhancements (later)
   - Integrate `@ant-design/pro-chat` and message formatting.
6) Iterative polish
   - Typography, spacing, color tuning.
   - Usability pass on Reader and Library.

## Review Loop
- After each step: quick UI review, adjust layout/spacing, then proceed.
- Keep changes small and easy to understand.

## Ant Design X Research (Chat UI)
Context captured from docs you provided:
- `@ant-design/x` (UI components): AI-focused UI layer with chat primitives (`Bubble`, `Sender`, `Conversations`, `Prompts`, etc.) built on Ant Design. Useful for quickly building a chat panel with consistent design and fewer custom styles.
- `@ant-design/x-markdown`: streaming-friendly Markdown renderer with code highlighting, mermaid, formulas; compatible with CommonMark/GFM. Useful for rich assistant responses.
- `@ant-design/x-sdk`: conversation data flow helpers and model/agent integration; optional for now since we already have backend chat APIs.

Potential fit for Socratium:
- Likely adopt `@ant-design/x` for the chat UI (message list + input + actions).
- Use `@ant-design/x-markdown` inside assistant messages to render responses cleanly.
- Defer `@ant-design/x-sdk` unless we want frontend-managed chat state or streaming support.

Open items:
- Review the `x-sdk` intro doc (link provided) before deciding on SDK adoption.

Additional notes from `@ant-design/x-sdk` intro:
- Purpose: data-flow helpers for AI chat (example uses `XRequest` with streaming callbacks).
- Useful if we move to streaming responses in the frontend.
- Not required if we continue simple request/response from our backend.
