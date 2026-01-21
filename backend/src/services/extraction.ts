import { buildPageMap, extractPdfData } from "../lib/pdf";
import { writeBookText } from "../lib/storage";
import { badRequest } from "../lib/errors";
import type { PageMapEntry } from "../lib/pdf";

export type ExtractionService = {
  extract: (bookId: string, pdfPath: string) => Promise<ExtractionResult>;
};

export type ExtractionResult = {
  textPath: string;
  outlineJson: string | null;
  pageMap: PageMapEntry[];
};

export function createExtractionService(): ExtractionService {
  return {
    async extract(bookId: string, pdfPath: string): Promise<ExtractionResult> {
      try {
        const extracted = await extractPdfData(pdfPath);
        const textPath = writeBookText(bookId, extracted.text);
        const outlineJson = extracted.outline ? JSON.stringify(extracted.outline) : null;
        const pageMap = buildPageMap(extracted.pages);
        return { textPath, outlineJson, pageMap };
      } catch (error) {
        throw badRequest("Failed to extract PDF text");
      }
    }
  };
}
