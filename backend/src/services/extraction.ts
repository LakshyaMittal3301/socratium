import fs from "fs";
import path from "path";
import { getBooksDir } from "../lib/paths";
import { buildPageMap, extractPdfData } from "../lib/pdf";
import { badRequest } from "../lib/errors";
import type { BooksRepository } from "../repositories/books";
import type { PageMapRepository } from "../repositories/page-map";

export type ExtractionService = {
  extractAndPersist: (bookId: string, pdfPath: string) => Promise<void>;
};

export function createExtractionService(repos: {
  books: BooksRepository;
  pageMap: PageMapRepository;
}): ExtractionService {
  return {
    async extractAndPersist(bookId: string, pdfPath: string): Promise<void> {
      try {
        const extracted = await extractPdfData(pdfPath);
        const textPath = path.join(getBooksDir(), `${bookId}.txt`);
        fs.writeFileSync(textPath, extracted.text, "utf8");

        repos.pageMap.replaceForBook(bookId, buildPageMap(extracted.pages));
        const outlineJson = extracted.outline ? JSON.stringify(extracted.outline) : null;
        repos.books.updateExtraction(bookId, textPath, outlineJson);
      } catch (error) {
        throw badRequest("Failed to extract PDF text");
      }
    }
  };
}
