import type { BookDto } from "@shared/types/api";

export type BookRecord = BookDto;

export type BooksRepository = {
  insert: (record: BookRecord) => void;
  list: () => BookRecord[];
};

export function createBooksRepository(db: import("better-sqlite3").Database): BooksRepository {
  return {
    insert(record: BookRecord): void {
      db.prepare(
        `INSERT INTO book (id, title, source_filename, pdf_path, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run(record.id, record.title, record.source_filename, record.pdf_path, record.created_at);
    },
    list(): BookRecord[] {
      return db
        .prepare(
          "SELECT id, title, source_filename, pdf_path, created_at FROM book ORDER BY created_at DESC"
        )
        .all() as BookRecord[];
    }
  };
}
