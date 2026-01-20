import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { getBooksDir } from "../lib/paths";
import { nowIso } from "../lib/time";
import type { BooksRepository, BookRecord } from "../repositories/books";
import type { UploadInput, UploadResult } from "../types/books";

export type BooksService = {
  createFromUpload: (input: UploadInput) => Promise<UploadResult>;
  list: () => BookRecord[];
};

function buildBookRecord(id: string, filename: string, pdfPath: string): BookRecord {
  return {
    id,
    title: path.parse(filename).name,
    source_filename: filename,
    pdf_path: pdfPath,
    created_at: nowIso()
  };
}

export function createBooksService(repos: { books: BooksRepository }): BooksService {
  return {
    async createFromUpload(input: UploadInput): Promise<UploadResult> {
      const bookId = crypto.randomUUID();
      const pdfPath = path.join(getBooksDir(), `${bookId}.pdf`);

      await pipeline(input.stream, fs.createWriteStream(pdfPath));

      repos.books.insert(buildBookRecord(bookId, input.filename, pdfPath));

      return { id: bookId };
    },
    list(): BookRecord[] {
      return repos.books.list();
    }
  };
}
