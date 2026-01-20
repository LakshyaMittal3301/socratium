import { useEffect, useState } from "react";
import type {
  BookDto,
  BookOutlineResponse,
  BookTextSampleResponse,
  OutlineNode,
  PageMapEntry,
  PageMapResponse,
  PageTextResponse
} from "@shared/types/api";

type DebugPanelProps = {
  books: BookDto[];
};

function DebugPanel({ books }: DebugPanelProps) {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [outline, setOutline] = useState<OutlineNode[] | null>(null);
  const [textSample, setTextSample] = useState<string>("");
  const [pageMap, setPageMap] = useState<PageMapEntry[]>([]);
  const [pageNumberInput, setPageNumberInput] = useState("1");
  const [pageText, setPageText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBookId && books.length > 0) {
      setSelectedBookId(books[0].id);
    }
  }, [books, selectedBookId]);

  useEffect(() => {
    if (selectedBookId && !books.find((book) => book.id === selectedBookId)) {
      setSelectedBookId(books[0]?.id ?? null);
    }
  }, [books, selectedBookId]);

  async function fetchOutline() {
    if (!selectedBookId) return;
    setError(null);
    try {
      const res = await fetch(`/api/debug/books/${selectedBookId}/outline`);
      if (!res.ok) {
        throw new Error(`Failed to load outline (${res.status})`);
      }
      const data = (await res.json()) as BookOutlineResponse;
      setOutline(data.outline);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load outline");
    }
  }

  async function fetchTextSample() {
    if (!selectedBookId) return;
    setError(null);
    try {
      const res = await fetch(`/api/debug/books/${selectedBookId}/text?limit=2000`);
      if (!res.ok) {
        throw new Error(`Failed to load text (${res.status})`);
      }
      const data = (await res.json()) as BookTextSampleResponse;
      setTextSample(data.text);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load text");
    }
  }

  async function fetchPageMap() {
    if (!selectedBookId) return;
    setError(null);
    try {
      const res = await fetch(`/api/debug/books/${selectedBookId}/page-map?limit=8`);
      if (!res.ok) {
        throw new Error(`Failed to load page map (${res.status})`);
      }
      const data = (await res.json()) as PageMapResponse;
      setPageMap(data.entries);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load page map");
    }
  }

  async function fetchPageText() {
    if (!selectedBookId) return;
    setError(null);
    const pageNumber = Number(pageNumberInput);
    if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
      setError("Enter a valid page number.");
      return;
    }
    try {
      const res = await fetch(`/api/debug/books/${selectedBookId}/pages/${pageNumber}/text`);
      if (!res.ok) {
        throw new Error(`Failed to load page text (${res.status})`);
      }
      const data = (await res.json()) as PageTextResponse;
      setPageText(data.text);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load page text");
    }
  }

  function handleSelectBook(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedBookId(event.target.value);
    setOutline(null);
    setTextSample("");
    setPageMap([]);
    setPageText("");
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Debug</h2>
        <button
          type="button"
          onClick={() => {
            setOutline(null);
            setTextSample("");
            setPageMap([]);
            setPageText("");
            setError(null);
          }}
        >
          Clear
        </button>
      </div>
      <div className="debug-controls">
        <select value={selectedBookId ?? ""} onChange={handleSelectBook}>
          <option value="" disabled>
            Select a book
          </option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
        <button type="button" onClick={fetchOutline} disabled={!selectedBookId}>
          Fetch outline
        </button>
        <button type="button" onClick={fetchTextSample} disabled={!selectedBookId}>
          Fetch text sample
        </button>
        <button type="button" onClick={fetchPageMap} disabled={!selectedBookId}>
          Fetch page map
        </button>
        <input
          type="number"
          min={1}
          value={pageNumberInput}
          onChange={(event) => setPageNumberInput(event.target.value)}
          aria-label="Page number"
        />
        <button type="button" onClick={fetchPageText} disabled={!selectedBookId}>
          Fetch page text
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {outline && <pre className="debug-output">{JSON.stringify(outline, null, 2)}</pre>}
      {textSample && <pre className="debug-output">{textSample}</pre>}
      {pageMap.length > 0 && (
        <pre className="debug-output">{JSON.stringify(pageMap, null, 2)}</pre>
      )}
      {pageText && <pre className="debug-output">{pageText}</pre>}
    </section>
  );
}

export default DebugPanel;
