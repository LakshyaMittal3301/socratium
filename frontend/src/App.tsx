import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadBooks();
  }, []);

  async function loadBooks() {
    setError(null);
    try {
      const res = await fetch("/api/books");
      if (!res.ok) {
        throw new Error(`Failed to load books (${res.status})`);
      }
      const data = (await res.json()) as BookRecord[];
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
    </div>
  );
}

type BookRecord = {
  id: string;
  title: string;
  source_filename: string;
  pdf_path: string;
  created_at: string;
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default App;
