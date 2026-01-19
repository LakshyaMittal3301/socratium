import { db } from "../db";

export type BookRecord = {
  id: string;
  title: string;
  source_filename: string;
  pdf_path: string;
  created_at: string;
};

export function insertBook(record: BookRecord): void {
  db.prepare(
    `INSERT INTO book (id, title, source_filename, pdf_path, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(record.id, record.title, record.source_filename, record.pdf_path, record.created_at);
}

export function listBooks(): BookRecord[] {
  return db
    .prepare("SELECT id, title, source_filename, pdf_path, created_at FROM book ORDER BY created_at DESC")
    .all() as BookRecord[];
}
