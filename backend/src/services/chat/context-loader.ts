import type { BooksService } from "../books";
import type { MessagesRepository, MessageRecord } from "../../repositories/messages";
import type { ChatMessageDto } from "@shared/types/chat";
import type { ChatContextLoader } from "./strategy";

type ContextLoaderDeps = {
  books: BooksService;
  messages: MessagesRepository;
  toMessageDto: (record: MessageRecord) => ChatMessageDto;
};

export function createChatContextLoader(deps: ContextLoaderDeps): ChatContextLoader {
  return {
    getRecentMessages(threadId, limit) {
      return deps.messages
        .listRecentByThread(threadId, limit)
        .reverse()
        .map(deps.toMessageDto);
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
