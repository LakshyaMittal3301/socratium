import type { BooksService } from "../books";
import type { MessagesRepository } from "../../repositories/messages";
import type { ChatContextLoader } from "./strategy";
import type { ChatMessage } from "./types";

type ContextLoaderDeps = {
  books: BooksService;
  messages: MessagesRepository;
};

export function createChatContextLoader(deps: ContextLoaderDeps): ChatContextLoader {
  return {
    getRecentMessages(threadId, limit) {
      return deps.messages
        .listRecentByThread(threadId, limit)
        .reverse()
        .map(toChatMessage);
    },
    getBookMeta(bookId) {
      return deps.books.getMeta(bookId);
    },
    getSectionTitle(bookId, pageNumber) {
      return deps.books.getSectionTitle(bookId, pageNumber);
    },
    getPageText(bookId, pageNumber) {
      return deps.books.tryGetPageText(bookId, pageNumber);
    }
  };
}

function toChatMessage(record: { role: string; content: string }): ChatMessage {
  return {
    role: record.role === "assistant" ? "assistant" : "user",
    content: record.content
  };
}
