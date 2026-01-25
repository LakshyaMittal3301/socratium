# Tech Spec — Reader Experience Improvements v1
**Status:** FINAL

## Scope
- Frontend reader PDF rendering, zoom behavior, and selection/copy support.
- Stability during layout changes (nav collapse, window resize) without visual flicker.
- Preserve existing current-page detection and outline/section syncing.

## Approach
- Enable React-PDF text layer (and its stylesheet) so selection/copy preserves formatting.
- Introduce a controlled zoom scale using the `scale` prop (and/or width + scale) for smooth pinch-zoom.
- Reduce re-render flicker during layout changes by stabilizing page rendering and throttling resize-driven width updates.
- Keep page/section detection accurate after any rendering changes.

## Key decisions / rules
- No regressions to current-page detection or outline syncing.
- Prioritize smooth zoom and stable rendering over instant resize responsiveness.
- Stay within the existing `react-pdf` / PDF.js stack; no new dependencies without approval.
- It’s acceptable to adjust rendering strategy (e.g., text layer, lazy loading) if needed for smoothness.
- Follow React-PDF guidance: worker is set in the same module as `<Document>/<Page>`, and if `file` is an object, it must be memoized.

## Slice boundaries (important)
- Out of scope: annotations, highlights, redesigning layout, or non-PDF formats.
- Stop and ask if changes threaten API/contract behavior or require new dependencies.

## Expected changes
- `frontend/src/components/PdfViewer.tsx` (rendering strategy, zoom, selection)
- `frontend/src/pages/ReaderPage.tsx` (if page detection/props need adjustment)
- `frontend/src/styles/pages/reader.css` (viewer/page styling for zoom/selection)
- Potentially `frontend/src/App.css` (import React-PDF TextLayer/AnnotationLayer styles)
- Potentially `frontend/src/styles/layout.css` (if layout tweaks are needed for stability)

## Implementation checklist
- [ ] Review `react-pdf`/PDF.js docs for text layer, annotation layer, and zoom scaling behavior.
- [ ] Add zoom state + trackpad pinch handling; apply smooth scaling via `scale` (and reconcile with width).
- [ ] Enable text layer (and import TextLayer CSS) for selectable, formatted copy.
- [ ] Stabilize rendering on resize/nav toggle; preserve page detection + outline syncing.

## Verification
- Manual: Load a multi-page PDF, pinch-zoom smoothly, and verify selection/copy preserves formatting.
- Manual: Collapse/expand nav and resize window without visible flicker.
- Manual: Confirm current page detection and section/outline syncing still update correctly.

## Progress log (optional)
- 
