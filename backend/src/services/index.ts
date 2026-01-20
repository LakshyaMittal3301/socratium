import type { Repositories } from "../repositories";
import { createBooksService } from "./books";
import { createExtractionService } from "./extraction";
import type { BooksService } from "./books";

export type Services = {
  books: BooksService;
};

export function createServices(repos: Repositories): Services {
  const extraction = createExtractionService({
    books: repos.books,
    pageMap: repos.pageMap
  });
  return {
    books: createBooksService({ books: repos.books, extraction, pageMap: repos.pageMap })
  };
}
