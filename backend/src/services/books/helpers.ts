import path from "path";
import { nowIso } from "../../lib/time";
import { notFound } from "../../lib/errors";
import type { BooksRepository, BookRecord, BookRow } from "../../repositories/books";
import type { BookMetaResponse } from "@shared/types/api";

export function buildBookRecord(id: string, filename: string, pdfPath: string): BookRecord {
  return {
    id,
    title: path.parse(filename).name,
    source_filename: filename,
    pdf_path: pdfPath,
    created_at: nowIso()
  };
}

export function requireBook(repos: BooksRepository, bookId: string): BookRow {
  const book = repos.getById(bookId);
  if (!book) {
    throw notFound("Book not found");
  }
  return book;
}

export function toBookMeta(book: BookRow): BookMetaResponse {
  return {
    id: book.id,
    title: book.title,
    source_filename: book.source_filename,
    pdf_path: book.pdf_path,
    created_at: book.created_at,
    has_text: Boolean(book.text_path),
    has_outline: Boolean(book.outline_json)
  };
}
