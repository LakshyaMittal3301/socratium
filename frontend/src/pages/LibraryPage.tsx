import type { FormEvent } from "react";
import { useState } from "react";
import type { BookDto } from "@shared/types/api";
import DebugPanel from "../components/DebugPanel";
import ProviderModal from "../components/ProviderModal";

type LibraryPageProps = {
  books: BookDto[];
  uploading: boolean;
  status: string | null;
  error: string | null;
  onUpload: (event: FormEvent<HTMLFormElement>) => void;
  onRefresh: () => void | Promise<void>;
  onOpenBook: (bookId: string) => void;
  debugEnabled: boolean;
};

function LibraryPage({
  books,
  uploading,
  status,
  error,
  onUpload,
  onRefresh,
  onOpenBook,
  debugEnabled
}: LibraryPageProps) {
  const [showProviders, setShowProviders] = useState(false);

  return (
    <div className="library">
      <header className="app__header">
        <h1>Socratium</h1>
        <p className="app__subtitle">Upload a PDF to start reading.</p>
      </header>

      <section className="panel">
        <h2>Upload</h2>
        <form onSubmit={onUpload} className="upload">
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
          <div className="panel__actions">
            <button type="button" onClick={() => setShowProviders(true)}>
              AI Settings
            </button>
            <button type="button" onClick={onRefresh}>
              Refresh
            </button>
          </div>
        </div>
        {books.length === 0 ? (
          <p className="muted">No books uploaded yet.</p>
        ) : (
          <ul className="book-list">
            {books.map((book) => (
              <li key={book.id} className="book">
                <div>
                  <div className="book__title">{book.title}</div>
                  <div className="book__meta">{book.source_filename}</div>
                  <div className="book__meta">{formatDate(book.created_at)}</div>
                </div>
                <div className="book__actions">
                  <button type="button" onClick={() => onOpenBook(book.id)}>
                    Open
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {debugEnabled && <DebugPanel books={books} />}
      <ProviderModal isOpen={showProviders} onClose={() => setShowProviders(false)} />
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default LibraryPage;
