import type { Repositories } from "../repositories";
import { createBooksService } from "./books";
import { createExtractionService } from "./extraction";
import { createChatService } from "./chat";
import type { BooksService } from "./books";
import type { ChatService } from "./chat";

export type Services = {
  books: BooksService;
  chat: ChatService;
};

export function createServices(repos: Repositories): Services {
  const extraction = createExtractionService({
    books: repos.books,
    pageMap: repos.pageMap
  });
  const books = createBooksService({ books: repos.books, extraction, pageMap: repos.pageMap });
  return {
    books,
    chat: createChatService({ books })
  };
}
