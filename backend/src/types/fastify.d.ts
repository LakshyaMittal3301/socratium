import type { BooksService } from "../services/books";
import type { ChatService } from "../services/chat";
import type { ProvidersService } from "../services/providers";
import type { BooksRepository } from "../repositories/books";
import type { PageMapRepository } from "../repositories/page-map";
import type { ProvidersRepository } from "../repositories/providers";
import type { Database } from "better-sqlite3";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
    repos: {
      books: BooksRepository;
      pageMap: PageMapRepository;
      providers: ProvidersRepository;
    };
    services: {
      books: BooksService;
      chat: ChatService;
      providers: ProvidersService;
    };
  }
}
