import type { BookDto, BookOutlineResponse, OutlineNode } from "@shared/types/api";
import { useEffect, useMemo, useState } from "react";
import PdfViewer from "../components/PdfViewer";
import ChatPanel from "../components/ChatPanel";
import OutlinePanel from "../components/OutlinePanel";
import type { OutlineEntry } from "../components/OutlinePanel";

type ReaderPageProps = {
  book: BookDto;
  onBack: () => void;
};

function ReaderPage({ book, onBack }: ReaderPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [outline, setOutline] = useState<OutlineNode[] | null>(null);
  const [outlineError, setOutlineError] = useState<string | null>(null);
  const fileUrl = `/api/books/${book.id}/file`;

  useEffect(() => {
    let cancelled = false;
    async function loadOutline() {
      setOutlineError(null);
      setOutline(null);
      try {
        const res = await fetch(`/api/books/${book.id}/outline`);
        if (!res.ok) {
          throw new Error(`Failed to load outline (${res.status})`);
        }
        const data = (await res.json()) as BookOutlineResponse;
        if (!cancelled) {
          setOutline(data.outline);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setOutlineError(err instanceof Error ? err.message : "Failed to load outline");
        }
      }
    }

    void loadOutline();
    return () => {
      cancelled = true;
    };
  }, [book.id]);

  const flatOutline = useMemo(() => flattenOutline(outline ?? []), [outline]);
  const currentEntry = useMemo(
    () => pickNearestOutline(flatOutline, currentPage),
    [flatOutline, currentPage]
  );
  const sectionTitle = currentEntry?.title ?? null;

  return (
    <div className="reader">
      <header className="reader__header panel">
        <div>
          <p className="reader__eyebrow">Reading</p>
          <h2>{book.title}</h2>
          <p className="muted">
            Section: {currentEntry?.title ?? "—"} · Page: {currentPage}
            {totalPages ? ` / ${totalPages}` : ""}
          </p>
        </div>
        <button type="button" onClick={onBack}>
          Back to library
        </button>
      </header>

      <div className="reader__layout">
        <aside className="panel reader__panel">
          <OutlinePanel
            entries={flatOutline}
            currentEntry={currentEntry}
            error={outlineError}
          />
        </aside>
        <main className="panel reader__panel reader__panel--center">
          <PdfViewer
            fileUrl={fileUrl}
            onPageChange={setCurrentPage}
            onDocumentLoad={setTotalPages}
          />
        </main>
        <aside className="panel reader__panel reader__panel--right">
          <ChatPanel bookId={book.id} currentPage={currentPage} sectionTitle={sectionTitle} />
        </aside>
      </div>
    </div>
  );
}

function flattenOutline(nodes: OutlineNode[], depth = 1) {
  const entries: OutlineEntry[] = [];
  for (const node of nodes) {
    entries.push({ title: node.title, pageNumber: node.pageNumber, depth });
    if (node.children.length) {
      entries.push(...flattenOutline(node.children, depth + 1));
    }
  }
  return entries;
}

function pickNearestOutline(
  entries: OutlineEntry[],
  pageNumber: number
) {
  const candidates = entries.filter(
    (entry) => entry.pageNumber !== null && entry.pageNumber <= pageNumber
  );
  if (candidates.length === 0) {
    return null;
  }
  return candidates.reduce((best, entry) => {
    if (!best || (entry.pageNumber ?? 0) > (best.pageNumber ?? 0)) {
      return entry;
    }
    return best;
  }, candidates[0]);
}

export default ReaderPage;
