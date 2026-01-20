import type { BookDto } from "@shared/types/api";
import { useState } from "react";
import PdfViewer from "../components/PdfViewer";

type ReaderPageProps = {
  book: BookDto;
  onBack: () => void;
};

function ReaderPage({ book, onBack }: ReaderPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const fileUrl = `/api/books/${book.id}/file`;

  return (
    <div className="reader">
      <header className="reader__header panel">
        <div>
          <p className="reader__eyebrow">Reading</p>
          <h2>{book.title}</h2>
          <p className="muted">
            Section: — · Page: {currentPage}
            {totalPages ? ` / ${totalPages}` : ""}
          </p>
        </div>
        <button type="button" onClick={onBack}>
          Back to library
        </button>
      </header>

      <div className="reader__layout">
        <aside className="panel reader__panel">
          <h2>Outline</h2>
          <p className="muted">Outline will appear here.</p>
        </aside>
        <main className="panel reader__panel reader__panel--center">
          <PdfViewer
            fileUrl={fileUrl}
            onPageChange={setCurrentPage}
            onDocumentLoad={setTotalPages}
          />
        </main>
        <aside className="panel reader__panel reader__panel--right">
          <h2>Chat</h2>
          <p className="muted">Chat panel will appear here.</p>
        </aside>
      </div>
    </div>
  );
}

export default ReaderPage;
