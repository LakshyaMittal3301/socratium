import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type PdfViewerProps = {
  fileUrl: string;
  onPageChange?: (pageNumber: number) => void;
  onDocumentLoad?: (numPages: number) => void;
};

function PdfViewer({ fileUrl, onPageChange, onDocumentLoad }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(680);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ratiosRef = useRef<Map<number, number>>(new Map());
  const lastPageRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function updateWidth() {
      const width = Math.max(320, container.clientWidth - 32);
      setPageWidth(width);
    }

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!numPages) return;
    pageRefs.current = Array.from({ length: numPages }, () => null);
    ratiosRef.current = new Map();
    lastPageRef.current = null;
    onDocumentLoad?.(numPages);
    onPageChange?.(1);
  }, [numPages, onDocumentLoad, onPageChange]);

  useEffect(() => {
    if (!numPages || !onPageChange) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const pageNumber = Number(entry.target.getAttribute("data-page"));
          if (!pageNumber) continue;
          ratiosRef.current.set(pageNumber, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestPage: number | null = null;
        let bestRatio = 0;
        for (const [page, ratio] of ratiosRef.current.entries()) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestPage = page;
          }
        }

        if (bestPage && bestPage !== lastPageRef.current) {
          lastPageRef.current = bestPage;
          onPageChange(bestPage);
        }
      },
      {
        root: container,
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    pageRefs.current.forEach((pageEl) => {
      if (pageEl) observer.observe(pageEl);
    });

    return () => observer.disconnect();
  }, [numPages, onPageChange]);

  return (
    <div className="pdf-viewer" ref={containerRef}>
      {error && <p className="error">{error}</p>}
      <Document
        file={fileUrl}
        onLoadSuccess={(doc) => {
          setError(null);
          setNumPages(doc.numPages);
        }}
        onLoadError={(err) => {
          setError(err instanceof Error ? err.message : "Failed to load PDF");
        }}
        loading={<p className="muted">Loading PDF…</p>}
      >
        {Array.from({ length: numPages }, (_, index) => (
          <div
            key={`page-${index + 1}`}
            className="pdf-page"
            ref={(el) => {
              pageRefs.current[index] = el;
            }}
            data-page={index + 1}
          >
            <Page
              pageNumber={index + 1}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </div>
        ))}
      </Document>
    </div>
  );
}

export default PdfViewer;
