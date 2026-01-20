import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { getBooksDir } from "../lib/paths";
import { insertBook, listBooks, BookRecord } from "../repositories/books";
import type { UploadBookResponse } from "@shared/types/api";

export type UploadInput = {
  filename: string;
  stream: NodeJS.ReadableStream;
};

export type UploadResult = UploadBookResponse;

export type BooksService = {
  createFromUpload: (input: UploadInput) => Promise<UploadResult>;
  list: () => BookRecord[];
};

function nowIso(): string {
  return new Date().toISOString();
}

export function createBooksService(): BooksService {
  return {
    async createFromUpload(input: UploadInput): Promise<UploadResult> {
      const bookId = crypto.randomUUID();
      const title = path.parse(input.filename).name;
      const pdfPath = path.join(getBooksDir(), `${bookId}.pdf`);

      await pipeline(input.stream, fs.createWriteStream(pdfPath));

      insertBook({
        id: bookId,
        title,
        source_filename: input.filename,
        pdf_path: pdfPath,
        created_at: nowIso()
      });

      return { id: bookId };
    },
    list(): BookRecord[] {
      return listBooks();
    }
  };
}
