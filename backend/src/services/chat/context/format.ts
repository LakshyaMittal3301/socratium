import type { PageContextEntry } from "./select";

export type ReadingContextInput = {
  bookTitle: string;
  sectionTitle: string | null;
  pageNumber: number;
  pages: PageContextEntry[];
};

export type ReadingContextResult = {
  readingContext: string;
  contextText: string;
  excerptStatus: "available" | "missing";
};

export function formatReadingContext(input: ReadingContextInput): ReadingContextResult {
  const contextText = input.pages
    .map((page) => `Page ${page.pageNumber}:\n${page.text}`)
    .join("\n\n");
  const excerptStatus = contextText.trim() ? "available" : "missing";
  const section = input.sectionTitle ?? "Unknown section";
  const excerptText = contextText.trim() || "(no excerpt text available)";

  const readingContext = [
    "[READING_CONTEXT]",
    `Book: ${input.bookTitle}`,
    `Section/Subsection: ${section}`,
    `Page: ${input.pageNumber}`,
    `ExcerptStatus: ${excerptStatus}`,
    "",
    "[BOOK_EXCERPT]",
    excerptText
  ].join("\n");

  return { readingContext, contextText, excerptStatus };
}
