import type { PageTextResponse } from "@shared/types/api";

export type PageContextEntry = {
  pageNumber: number;
  text: string;
};

export type PageTextLookup = (
  pageNumber: number
) => PageTextResponse | null | Promise<PageTextResponse | null>;

export type ContextSelectionInput = {
  pageNumber: number;
  previewPages: number;
  getPageText: PageTextLookup;
};

export async function selectContext(input: ContextSelectionInput): Promise<PageContextEntry[]> {
  const pages: PageContextEntry[] = [];
  const start = Math.max(1, input.pageNumber - (input.previewPages - 1));
  for (let page = start; page <= input.pageNumber; page += 1) {
    const data = await input.getPageText(page);
    if (!data) continue;
    pages.push({ pageNumber: data.page_number, text: data.text });
  }
  return pages;
}
