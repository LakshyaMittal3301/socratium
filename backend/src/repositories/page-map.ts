import crypto from "crypto";
import type { PageMapEntry } from "../lib/pdf";

export type PageMapRepository = {
  replaceForBook: (bookId: string, entries: PageMapEntry[]) => void;
  listRange: (bookId: string, startPage: number, endPage: number) => PageMapEntry[];
  getEntry: (bookId: string, pageNumber: number) => PageMapEntry | null;
};

export function createPageMapRepository(db: import("better-sqlite3").Database): PageMapRepository {
  return {
    replaceForBook(bookId: string, entries: PageMapEntry[]): void {
      const remove = db.prepare("DELETE FROM page_map WHERE book_id = ?");
      const insert = db.prepare(
        `INSERT INTO page_map (id, book_id, page_number, start_offset, end_offset)
         VALUES (?, ?, ?, ?, ?)`
      );
      const tx = db.transaction(() => {
        remove.run(bookId);
        entries.forEach((entry) => {
          insert.run(
            crypto.randomUUID(),
            bookId,
            entry.page_number,
            entry.start_offset,
            entry.end_offset
          );
        });
      });
      tx();
    },
    listRange(bookId: string, startPage: number, endPage: number): PageMapEntry[] {
      if (endPage < startPage) {
        return [];
      }
      return db
        .prepare(
          "SELECT page_number, start_offset, end_offset FROM page_map WHERE book_id = ? AND page_number BETWEEN ? AND ? ORDER BY page_number"
        )
        .all(bookId, startPage, endPage) as PageMapEntry[];
    },
    getEntry(bookId: string, pageNumber: number): PageMapEntry | null {
      return (
        db
          .prepare(
            "SELECT page_number, start_offset, end_offset FROM page_map WHERE book_id = ? AND page_number = ?"
          )
          .get(bookId, pageNumber) as PageMapEntry | undefined
      ) ?? null;
    }
  };
}
