import fs from "fs";
import type { OutlineNode } from "@shared/types/api";

export type ExtractedPdf = {
  text: string;
  pages: string[];
  outline: OutlineNode[] | null;
};

export type PageMapEntry = {
  page_number: number;
  start_offset: number;
  end_offset: number;
};

async function loadPdfjs() {
  return import("pdfjs-dist/legacy/build/pdf.mjs");
}

export async function extractPdfData(pdfPath: string): Promise<ExtractedPdf> {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdfjs = await loadPdfjs();
  const loadingTask = pdfjs.getDocument({ data, disableWorker: true });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent({
      normalizeWhitespace: true,
      disableCombineTextItems: false
    });
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    pages.push(pageText);
  }

  const outline = await extractOutline(pdf);
  const text = pages.join("\n\n");
  return { text, pages, outline };
}

export function buildPageMap(pages: string[]): PageMapEntry[] {
  const pageMap: PageMapEntry[] = [];
  let offset = 0;
  const joiner = "\n\n";

  pages.forEach((pageText, index) => {
    const start_offset = offset;
    const end_offset = start_offset + pageText.length;
    pageMap.push({
      page_number: index + 1,
      start_offset,
      end_offset
    });
    offset = end_offset + joiner.length;
  });

  return pageMap;
}

async function extractOutline(pdf: any): Promise<OutlineNode[] | null> {
  const outline = await pdf.getOutline();
  if (!outline) return null;
  return mapOutlineItems(pdf, outline);
}

async function mapOutlineItems(pdf: any, items: any[]): Promise<OutlineNode[]> {
  const results = await Promise.all(
    items.map(async (item) => {
      const pageNumber = await resolvePageNumber(pdf, item.dest);
      const children = item.items?.length ? await mapOutlineItems(pdf, item.items) : [];
      return {
        title: item.title || "Untitled",
        pageNumber,
        children
      };
    })
  );
  return results;
}

async function resolvePageNumber(pdf: any, dest: any): Promise<number | null> {
  try {
    let destination = dest;
    if (typeof destination === "string") {
      destination = await pdf.getDestination(destination);
    }
    if (!Array.isArray(destination) || destination.length === 0) return null;
    const ref = destination[0];
    if (!ref) return null;
    const pageIndex = await pdf.getPageIndex(ref);
    return pageIndex + 1;
  } catch {
    return null;
  }
}
