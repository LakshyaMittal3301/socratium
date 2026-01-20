import type { Database } from "better-sqlite3";
import { createBooksRepository } from "./books";
import { createPageMapRepository } from "./page-map";
import { createProvidersRepository } from "./providers";
import type { BooksRepository } from "./books";
import type { PageMapRepository } from "./page-map";
import type { ProvidersRepository } from "./providers";

export type Repositories = {
  books: BooksRepository;
  pageMap: PageMapRepository;
  providers: ProvidersRepository;
};

export function createRepositories(db: Database): Repositories {
  return {
    books: createBooksRepository(db),
    pageMap: createPageMapRepository(db),
    providers: createProvidersRepository(db)
  };
}
