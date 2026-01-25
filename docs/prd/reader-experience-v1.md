# Reader Experience Improvements v1
**Status:** FINAL

## One-sentence outcome
Readers can smoothly zoom the PDF with a trackpad, select and copy formatted text, and avoid visible flicker during layout changes.

## Problem
The current PDF reader renders pages as canvases only and recomputes page widths on layout changes. This blocks text selection/copy and causes visible flicker when the nav collapses or the window resizes. These issues make the reading experience feel brittle and less like a dedicated PDF/ebook reader.

## Users / Use cases
- Readers reviewing PDFs who need to zoom in/out with a trackpad while keeping the page stable.
- Users who want to select and copy passages from the PDF (keeping formatting).
- Readers toggling the app navigation or resizing the window without distracting re-render flicker.

## Success criteria (observable)
- Trackpad pinch-zoom changes PDF scale smoothly within a reasonable range without jank.
- PDF text can be selected and copied with formatting preserved.
- Collapsing the left navigation or resizing the window does not cause noticeable flicker of the rendered pages (a brief, smooth resize is acceptable).
- The reader still loads multi-page PDFs reliably and remains responsive.
- Existing reader functionality remains intact, including current page detection and section/outline syncing.

## Non-goals
- Building annotation, highlighting, or note-taking tools.
- Redesigning the reader layout or chat panel UI.
- Supporting non-PDF formats in this iteration.

## Constraints / assumptions
- Frontend uses `react-pdf` / PDF.js for rendering; changes should stay within this stack.
- Local-first and security constraints remain (no API keys or user content leakage to the client).
- It is acceptable to change rendering strategy (e.g., enable text/annotation layers or introduce lazy loading) if it improves smoothness and stability.
- If changes impact page/section detection, they must be updated to preserve the current behavior.
