import type { BooksService } from "../books";
import type { MessagesRepository, MessageRecord } from "../../repositories/messages";
import type { ChatMessageDto } from "@shared/types/chat";
import { formatReadingContext, selectContext } from "./context";
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
    getReadingContext({ bookId, pageNumber, sectionTitle, previewPages }) {
      const bookMeta = deps.books.getMeta(bookId);
      const pages = selectContext({
        books: deps.books,
        bookId,
        pageNumber,
        previewPages
      });
      return formatReadingContext({
        bookTitle: bookMeta.title,
        sectionTitle,
        pageNumber,
        pages
      });
    }
  };
}
