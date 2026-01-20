import type { BooksService } from "./books";
import type { ChatRequest, ChatResponse } from "@shared/types/api";

const PAGE_TEXT_LIMIT = 1000;

export type ChatService = {
  reply: (input: ChatRequest) => ChatResponse;
};

export function createChatService(deps: { books: BooksService }): ChatService {
  return {
    reply(input: ChatRequest): ChatResponse {
      const page = deps.books.getPageText(input.bookId, input.pageNumber);
      const pageText = page.text.slice(0, PAGE_TEXT_LIMIT);
      const sectionTitle = input.sectionTitle?.trim() || null;
      const sectionLabel = sectionTitle ?? "this section";
      const reply = `You're reading ${sectionLabel} on page ${input.pageNumber}. ${input.message}`;

      return {
        reply,
        pageNumber: input.pageNumber,
        sectionTitle,
        pageText
      };
    }
  };
}
