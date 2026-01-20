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
import "./App.css";

function App() {
  const debugEnabled = import.meta.env.VITE_DEBUG === "true";
  const [books, setBooks] = useState<BookDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [outline, setOutline] = useState<OutlineNode[] | null>(null);
  const [textSample, setTextSample] = useState<string>("");
  const [pageMap, setPageMap] = useState<PageMapEntry[]>([]);
  const [pageNumberInput, setPageNumberInput] = useState("1");
  const [pageText, setPageText] = useState<string>("");

  useEffect(() => {
    void loadBooks();
  }, []);

  useEffect(() => {
    if (!selectedBookId && books.length > 0) {
      setSelectedBookId(books[0].id);
    }
  }, [books, selectedBookId]);

  async function loadBooks() {
    setError(null);
    try {
      const res = await fetch("/api/books");
      if (!res.ok) {
        throw new Error(`Failed to load books (${res.status})`);
      }
      const data = (await res.json()) as BookDto[];
      setBooks(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load books");
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setError(null);

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("pdf") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) {
      setError("Pick a PDF to upload.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/books/upload", { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || `Upload failed (${res.status})`);
      }
      setStatus("Uploaded.");
      if (fileInput) fileInput.value = "";
      await loadBooks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

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
    <div className="app">
      <header className="app__header">
        <h1>Socratium</h1>
        <p className="app__subtitle">Upload a PDF to confirm backend wiring.</p>
      </header>

      <section className="panel">
        <h2>Upload</h2>
        <form onSubmit={handleUpload} className="upload">
          <input type="file" name="pdf" accept="application/pdf" />
          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>
        </form>
        {status && <p className="status">{status}</p>}
        {error && <p className="error">{error}</p>}
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Books</h2>
          <button type="button" onClick={loadBooks}>
            Refresh
          </button>
        </div>
        {books.length === 0 ? (
          <p className="muted">No books uploaded yet.</p>
        ) : (
          <ul className="book-list">
            {books.map((book) => (
              <li key={book.id} className="book">
                <div className="book__title">{book.title}</div>
                <div className="book__meta">{book.source_filename}</div>
                <div className="book__meta">{formatDate(book.created_at)}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {debugEnabled && (
        <section className="panel">
        <div className="panel__header">
          <h2>Debug</h2>
          <button type="button" onClick={() => {
            setOutline(null);
            setTextSample("");
            setPageMap([]);
            setPageText("");
          }}>
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
        {outline && (
          <pre className="debug-output">{JSON.stringify(outline, null, 2)}</pre>
        )}
        {textSample && <pre className="debug-output">{textSample}</pre>}
        {pageMap.length > 0 && (
          <pre className="debug-output">{JSON.stringify(pageMap, null, 2)}</pre>
        )}
        {pageText && <pre className="debug-output">{pageText}</pre>}
      </section>
      )}
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default App;
