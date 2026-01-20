import type { BookDto } from "@shared/types/api";

type ReaderPageProps = {
  book: BookDto;
  onBack: () => void;
};

function ReaderPage({ book, onBack }: ReaderPageProps) {
  return (
    <div className="reader">
      <header className="reader__header panel">
        <div>
          <p className="reader__eyebrow">Reading</p>
          <h2>{book.title}</h2>
          <p className="muted">Section: — · Page: —</p>
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
          <h2>PDF Viewer</h2>
          <p className="reader__placeholder">
            PDF pages will render here in the next step.
          </p>
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
