import type { BookDto } from "@shared/types/api";
import { useState } from "react";
import PdfViewer from "../components/PdfViewer";
import ChatPanel from "../components/ChatPanel";

type ReaderPageProps = {
  book: BookDto;
};

function ReaderPage({ book }: ReaderPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const fileUrl = `/api/books/${book.id}/file`;

  return (
    <div className="reader">
      <div className="reader__layout">
        <main className="panel reader__panel reader__panel--center">
          <PdfViewer
            fileUrl={fileUrl}
            onPageChange={setCurrentPage}
            onDocumentLoad={setTotalPages}
          />
        </main>
        <aside className="panel reader__panel reader__panel--right">
          <ChatPanel bookId={book.id} currentPage={currentPage} sectionTitle={null} />
        </aside>
      </div>
    </div>
  );
}

export default ReaderPage;
