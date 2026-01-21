import type { BooksService } from "../books";

export type PageContextEntry = {
  pageNumber: number;
  text: string;
};

export function collectPageContext(
  books: BooksService,
  bookId: string,
  pageNumber: number,
  previewPages: number
): PageContextEntry[] {
  const pages: PageContextEntry[] = [];
  const start = Math.max(1, pageNumber - (previewPages - 1));
  for (let page = start; page <= pageNumber; page += 1) {
    const data = books.tryGetPageText(bookId, page);
    if (!data) continue;
    pages.push({ pageNumber: data.page_number, text: data.text });
  }
  return pages;
}
