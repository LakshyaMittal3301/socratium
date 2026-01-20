import type { Database } from "better-sqlite3";
import { createBooksRepository } from "./books";
import type { BooksRepository } from "./books";

export type Repositories = {
  books: BooksRepository;
};

export function createRepositories(db: Database): Repositories {
  return {
    books: createBooksRepository(db)
  };
}
