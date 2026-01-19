import Fastify, { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { initDb } from "./db";
import { registerHealthRoutes } from "./routes/health";
import { registerBookRoutes } from "./routes/books";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });
  initDb();
  app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024
    }
  });
  registerHealthRoutes(app);
  registerBookRoutes(app);
  return app;
}
