import crypto from "crypto";
import { notFound } from "../lib/errors";
import { createPdfReadStream, readBookText, removeBookFiles, savePdfStream } from "../lib/storage";
import type { BooksRepository, BookRecord } from "../repositories/books";
import type { PageMapRepository } from "../repositories/page-map";
import type { UploadInput, UploadResult } from "../types/books";
import type {
  BookMetaResponse,
  BookOutlineResponse,
  BookTextSampleResponse,
  OutlineNode,
  PageMapResponse,
  PageTextResponse
} from "@shared/types/api";
import type { ExtractionService } from "./extraction";
import { buildBookRecord, requireBook, toBookMeta } from "./books/helpers";

export type BooksService = {
  createFromUpload: (input: UploadInput) => Promise<UploadResult>;
  list: () => BookRecord[];
  getMeta: (bookId: string) => BookMetaResponse;
  getPdfStream: (bookId: string) => NodeJS.ReadableStream;
  getTextSample: (bookId: string, limit: number) => BookTextSampleResponse;
  getOutline: (bookId: string) => BookOutlineResponse;
  getPageMap: (bookId: string, limit: number) => PageMapResponse;
  getPageText: (bookId: string, pageNumber: number) => PageTextResponse;
  tryGetPageText: (bookId: string, pageNumber: number) => PageTextResponse | null;
  getSectionTitle: (bookId: string, pageNumber: number) => string | null;
  deleteBook: (bookId: string) => void;
};

export function createBooksService(deps: {
  books: BooksRepository;
  extraction: ExtractionService;
  pageMap: PageMapRepository;
}): BooksService {
  return {
    async createFromUpload(input: UploadInput): Promise<UploadResult> {
      const bookId = crypto.randomUUID();
      const pdfPath = await savePdfStream(bookId, input.stream);
      deps.books.insert(buildBookRecord(bookId, input.filename, pdfPath));
      const extracted = await deps.extraction.extract(bookId, pdfPath);
      deps.pageMap.replaceForBook(bookId, extracted.pageMap);
      deps.books.updateExtraction(bookId, extracted.textPath, extracted.outlineJson);

      return { id: bookId };
    },
    list(): BookRecord[] {
      return deps.books.list();
    },
    getMeta(bookId: string) {
      const book = requireBook(deps.books, bookId);
      return toBookMeta(book);
    },
    getPdfStream(bookId: string): NodeJS.ReadableStream {
      const book = requireBook(deps.books, bookId);
      return createPdfReadStream(book.pdf_path);
    },
    getTextSample(bookId: string, limit: number): BookTextSampleResponse {
      const book = requireBook(deps.books, bookId);
      if (!book.text_path) {
        throw notFound("Text not available");
      }
      const text = readBookText(book.text_path);
      return { text: text.slice(0, limit) };
    },
    getOutline(bookId: string): BookOutlineResponse {
      const book = requireBook(deps.books, bookId);
      if (!book.outline_json) {
        return { outline: null };
      }
      return { outline: JSON.parse(book.outline_json) as OutlineNode[] };
    },
    getPageMap(bookId: string, limit: number): PageMapResponse {
      requireBook(deps.books, bookId);
      const resolvedLimit = Math.max(0, limit);
      const entries = deps.pageMap.listRange(bookId, 1, resolvedLimit);
      return { entries };
    },
    getPageText(bookId: string, pageNumber: number): PageTextResponse {
      return getPageTextForBook(deps, bookId, pageNumber);
    },
    tryGetPageText(bookId: string, pageNumber: number): PageTextResponse | null {
      try {
        return getPageTextForBook(deps, bookId, pageNumber);
      } catch {
        return null;
      }
    },
    getSectionTitle(bookId: string, pageNumber: number): string | null {
      const book = requireBook(deps.books, bookId);
      if (!book.outline_json) {
        return null;
      }
      let outline: OutlineNode[] | null = null;
      try {
        outline = JSON.parse(book.outline_json) as OutlineNode[];
      } catch {
        return null;
      }
      return findSectionTitle(outline ?? [], pageNumber);
    },
    deleteBook(bookId: string): void {
      const book = requireBook(deps.books, bookId);
      deps.books.remove(bookId);
      removeBookFiles(book.pdf_path, book.text_path);
    }
  };
}

function getPageTextForBook(
  deps: {
    books: BooksRepository;
    pageMap: PageMapRepository;
  },
  bookId: string,
  pageNumber: number
): PageTextResponse {
  const book = requireBook(deps.books, bookId);
  if (!book.text_path) {
    throw notFound("Text not available");
  }
  const entry = deps.pageMap.getEntry(bookId, pageNumber);
  if (!entry) {
    throw notFound("Page not found");
  }
  const text = readBookText(book.text_path);
  return {
    page_number: entry.page_number,
    text: text.slice(entry.start_offset, entry.end_offset)
  };
}

type OutlineEntry = {
  title: string;
  pageNumber: number | null;
  depth: number;
};

function findSectionTitle(nodes: OutlineNode[], pageNumber: number): string | null {
  const entries = flattenOutline(nodes);
  const candidates = entries.filter(
    (entry) => entry.pageNumber !== null && entry.pageNumber <= pageNumber
  );
  if (candidates.length === 0) {
    return null;
  }
  const nearest = candidates.reduce((best, entry) => {
    if (!best || (entry.pageNumber ?? 0) > (best.pageNumber ?? 0)) {
      return entry;
    }
    return best;
  }, candidates[0]);
  return nearest.title ?? null;
}

function flattenOutline(nodes: OutlineNode[], depth = 1): OutlineEntry[] {
  const entries: OutlineEntry[] = [];
  for (const node of nodes) {
    entries.push({ title: node.title, pageNumber: node.pageNumber, depth });
    if (node.children.length) {
      entries.push(...flattenOutline(node.children, depth + 1));
    }
  }
  return entries;
}
