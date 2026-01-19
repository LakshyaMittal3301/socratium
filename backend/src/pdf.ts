import fs from "fs";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export type ExtractedPdf = {
  text: string;
  pages: string[];
};

export async function extractPdfText(pdfPath: string): Promise<ExtractedPdf> {
  const dataBuffer = fs.readFileSync(pdfPath);
  const pages: string[] = [];

  const renderPage = (pageData: any) => {
    const renderOptions = {
      normalizeWhitespace: true,
      disableCombineTextItems: false
    };

    return pageData.getTextContent(renderOptions).then((textContent: any) => {
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      pages.push(pageText);
      return pageText;
    });
  };

  await pdfParse(dataBuffer, { pagerender: renderPage });
  const text = pages.join("\n\n");

  return { text, pages };
}

export function buildPageMap(pages: string[]): { start: number; end: number }[] {
  const pageMap: { start: number; end: number }[] = [];
  let offset = 0;

  pages.forEach((pageText) => {
    const start = offset;
    const end = start + pageText.length;
    pageMap.push({ start, end });
    offset = end + 2; // account for the "\n\n" joiner
  });

  return pageMap;
}

export function buildSections(
  pages: string[],
  pageMap: { start: number; end: number }[],
  pagesPerSection: number
): { startPage: number; endPage: number; startOffset: number; endOffset: number; title: string }[] {
  const sections: { startPage: number; endPage: number; startOffset: number; endOffset: number; title: string }[] = [];

  for (let i = 0; i < pages.length; i += pagesPerSection) {
    const startPage = i + 1;
    const endPage = Math.min(i + pagesPerSection, pages.length);
    const startOffset = pageMap[startPage - 1]?.start ?? 0;
    const endOffset = pageMap[endPage - 1]?.end ?? startOffset;
    const title = `Pages ${startPage}–${endPage}`;

    sections.push({ startPage, endPage, startOffset, endOffset, title });
  }

  return sections;
}
