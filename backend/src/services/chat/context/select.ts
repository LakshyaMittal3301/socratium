import type { BooksService } from "../../books";

export type PageContextEntry = {
  pageNumber: number;
  text: string;
};

export type ContextSelectionInput = {
  books: BooksService;
  bookId: string;
  pageNumber: number;
  previewPages: number;
};

export function selectContext(input: ContextSelectionInput): PageContextEntry[] {
  const pages: PageContextEntry[] = [];
  const start = Math.max(1, input.pageNumber - (input.previewPages - 1));
  for (let page = start; page <= input.pageNumber; page += 1) {
    const data = input.books.tryGetPageText(input.bookId, page);
    if (!data) continue;
    pages.push({ pageNumber: data.page_number, text: data.text });
  }
  return pages;
}
