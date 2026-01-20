import type { BookDto } from "@shared/types/api";

export type BookRecord = BookDto;

export type BookRow = BookDto & {
  text_path: string | null;
  outline_json: string | null;
};

export type BookInsert = BookDto & {
  text_path?: string | null;
  outline_json?: string | null;
};

export type BooksRepository = {
  insert: (record: BookInsert) => void;
  list: () => BookRecord[];
  getById: (bookId: string) => BookRow | null;
  updateExtraction: (bookId: string, textPath: string, outlineJson: string | null) => void;
};

const BOOK_SELECT_FIELDS = "id, title, source_filename, pdf_path, created_at";
const BOOK_SELECT_WITH_EXTRA =
  "id, title, source_filename, pdf_path, text_path, outline_json, created_at";

export function createBooksRepository(db: import("better-sqlite3").Database): BooksRepository {
  return {
    insert(record: BookInsert): void {
      db.prepare(
        `INSERT INTO book (id, title, source_filename, pdf_path, text_path, outline_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        record.id,
        record.title,
        record.source_filename,
        record.pdf_path,
        record.text_path ?? null,
        record.outline_json ?? null,
        record.created_at
      );
    },
    list(): BookRecord[] {
      return db
        .prepare(`SELECT ${BOOK_SELECT_FIELDS} FROM book ORDER BY created_at DESC`)
        .all() as BookRecord[];
    },
    getById(bookId: string): BookRow | null {
      return (
        db
          .prepare(`SELECT ${BOOK_SELECT_WITH_EXTRA} FROM book WHERE id = ?`)
          .get(bookId) as BookRow | undefined
      ) ?? null;
    },
    updateExtraction(bookId: string, textPath: string, outlineJson: string | null): void {
      db.prepare("UPDATE book SET text_path = ?, outline_json = ? WHERE id = ?").run(
        textPath,
        outlineJson,
        bookId
      );
    }
  };
}
