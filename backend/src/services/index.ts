import type { Repositories } from "../repositories";
import { createBooksService } from "./books";
import { createExtractionService } from "./extraction";
import { createChatService } from "./chat";
import { createProvidersService } from "./providers";
import type { BooksService } from "./books";
import type { ChatService } from "./chat";
import type { ProvidersService } from "./providers";

export type Services = {
  books: BooksService;
  chat: ChatService;
  providers: ProvidersService;
};

export function createServices(repos: Repositories): Services {
  const extraction = createExtractionService({
    books: repos.books,
    pageMap: repos.pageMap
  });
  const books = createBooksService({ books: repos.books, extraction, pageMap: repos.pageMap });
  const providers = createProvidersService({ providers: repos.providers });
  return {
    books,
    chat: createChatService({ books, providers }),
    providers
  };
}
