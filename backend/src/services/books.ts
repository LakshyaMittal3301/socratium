import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { getBooksDir } from "../lib/paths";
import { nowIso } from "../lib/time";
import { notFound } from "../lib/errors";
import type { BooksRepository, BookRecord } from "../repositories/books";
import type { UploadInput, UploadResult } from "../types/books";
import type {
  BookMetaResponse,
  BookOutlineResponse,
  BookTextSampleResponse,
  OutlineNode
} from "@shared/types/api";
import type { ExtractionService } from "./extraction";

export type BooksService = {
  createFromUpload: (input: UploadInput) => Promise<UploadResult>;
  list: () => BookRecord[];
  getMeta: (bookId: string) => BookMetaResponse;
  getTextSample: (bookId: string, limit: number) => BookTextSampleResponse;
  getOutline: (bookId: string) => BookOutlineResponse;
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

export function createBooksService(deps: {
  books: BooksRepository;
  extraction: ExtractionService;
}): BooksService {
  return {
    async createFromUpload(input: UploadInput): Promise<UploadResult> {
      const bookId = crypto.randomUUID();
      const pdfPath = path.join(getBooksDir(), `${bookId}.pdf`);

      await pipeline(input.stream, fs.createWriteStream(pdfPath));

      deps.books.insert(buildBookRecord(bookId, input.filename, pdfPath));
      await deps.extraction.extractAndPersist(bookId, pdfPath);

      return { id: bookId };
    },
    list(): BookRecord[] {
      return deps.books.list();
    },
    getMeta(bookId: string): BookMetaResponse {
      const book = requireBook(deps.books, bookId);
      return {
        id: book.id,
        title: book.title,
        source_filename: book.source_filename,
        pdf_path: book.pdf_path,
        created_at: book.created_at,
        has_text: Boolean(book.text_path),
        has_outline: Boolean(book.outline_json)
      };
    },
    getTextSample(bookId: string, limit: number): BookTextSampleResponse {
      const book = requireBook(deps.books, bookId);
      if (!book.text_path) {
        throw notFound("Text not available");
      }
      const text = fs.readFileSync(book.text_path, "utf8");
      return { text: text.slice(0, limit) };
    },
    getOutline(bookId: string): BookOutlineResponse {
      const book = requireBook(deps.books, bookId);
      if (!book.outline_json) {
        return { outline: null };
      }
      return { outline: JSON.parse(book.outline_json) as OutlineNode[] };
    }
  };
}

function requireBook(repos: BooksRepository, bookId: string) {
  const book = repos.getById(bookId);
  if (!book) {
    throw notFound("Book not found");
  }
  return book;
}
