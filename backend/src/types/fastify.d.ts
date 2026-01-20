import type { BooksService } from "../services/books";

declare module "fastify" {
  interface FastifyInstance {
    services: {
      books: BooksService;
    };
  }
}
