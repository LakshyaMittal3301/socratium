import { useEffect, useState } from "react";
import type { BookDto } from "@shared/types/api";
import LibraryPage from "./pages/LibraryPage";
import ReaderPage from "./pages/ReaderPage";
import "./App.css";

function App() {
  const debugEnabled = import.meta.env.VITE_DEBUG === "true";
  const [books, setBooks] = useState<BookDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);

  useEffect(() => {
    void loadBooks();
  }, []);

  const activeBook = books.find((book) => book.id === activeBookId) ?? null;

  useEffect(() => {
    if (activeBookId && !activeBook) {
      setActiveBookId(null);
    }
  }, [activeBookId, activeBook]);

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

  function handleOpenBook(bookId: string) {
    setActiveBookId(bookId);
  }

  if (activeBook) {
    return <ReaderPage book={activeBook} onBack={() => setActiveBookId(null)} />;
  }

  return (
    <LibraryPage
      books={books}
      uploading={uploading}
      status={status}
      error={error}
      onUpload={handleUpload}
      onRefresh={loadBooks}
      onOpenBook={handleOpenBook}
      debugEnabled={debugEnabled}
    />
  );
}

export default App;
