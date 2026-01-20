import type { Repositories } from "../repositories";
import { createBooksService } from "./books";
import type { BooksService } from "./books";

export type Services = {
  books: BooksService;
};

export function createServices(repos: Repositories): Services {
  return {
    books: createBooksService({ books: repos.books })
  };
}
