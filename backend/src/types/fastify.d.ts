import type { BooksService } from "../services/books";
import type { BooksRepository } from "../repositories/books";
import type { Database } from "better-sqlite3";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
    repos: {
      books: BooksRepository;
    };
    services: {
      books: BooksService;
    };
  }
}
