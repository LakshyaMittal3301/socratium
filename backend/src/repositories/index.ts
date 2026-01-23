import type { Database } from "better-sqlite3";
import { createBooksRepository } from "./books";
import { createPageMapRepository } from "./page-map";
import { createProvidersRepository } from "./providers";
import { createThreadsRepository } from "./threads";
import { createMessagesRepository } from "./messages";
import type { BooksRepository } from "./books";
import type { PageMapRepository } from "./page-map";
import type { ProvidersRepository } from "./providers";
import type { ThreadsRepository } from "./threads";
import type { MessagesRepository } from "./messages";

export type Repositories = {
  books: BooksRepository;
  pageMap: PageMapRepository;
  providers: ProvidersRepository;
  threads: ThreadsRepository;
  messages: MessagesRepository;
};

export function createRepositories(db: Database): Repositories {
  return {
    books: createBooksRepository(db),
    pageMap: createPageMapRepository(db),
    providers: createProvidersRepository(db),
    threads: createThreadsRepository(db),
    messages: createMessagesRepository(db)
  };
}
