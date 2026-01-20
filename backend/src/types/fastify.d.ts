import type { BooksService } from "../services/books";
import type { ChatService } from "../services/chat";
import type { BooksRepository } from "../repositories/books";
import type { PageMapRepository } from "../repositories/page-map";
import type { Database } from "better-sqlite3";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
    repos: {
      books: BooksRepository;
      pageMap: PageMapRepository;
    };
    services: {
      books: BooksService;
      chat: ChatService;
    };
  }
}
