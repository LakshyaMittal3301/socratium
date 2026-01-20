import type { Database } from "better-sqlite3";
import { createBooksRepository } from "./books";
import { createPageMapRepository } from "./page-map";
import type { BooksRepository } from "./books";
import type { PageMapRepository } from "./page-map";

export type Repositories = {
  books: BooksRepository;
  pageMap: PageMapRepository;
};

export function createRepositories(db: Database): Repositories {
  return {
    books: createBooksRepository(db),
    pageMap: createPageMapRepository(db)
  };
}
