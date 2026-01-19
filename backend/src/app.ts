import Fastify, { FastifyInstance } from "fastify";
import { initDb } from "./db";
import { registerHealthRoutes } from "./routes/health";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });
  initDb();
  registerHealthRoutes(app);
  return app;
}
