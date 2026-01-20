import Fastify, { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { initDb, db } from "./db";
import { createServices } from "./services";
import { createRepositories } from "./repositories";
import { AppError } from "./lib/errors";
import { outlineNodeSchema } from "./schemas/books";
import { registerRoutes } from "./routes";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });
  initDb();
  app.decorate("db", db);
  registerSchemas(app);
  registerServices(app);
  registerPlugins(app);
  registerErrorHandlers(app);
  registerRoutes(app);
  return app;
}

function registerSchemas(app: FastifyInstance): void {
  app.addSchema(outlineNodeSchema);
}

function registerServices(app: FastifyInstance): void {
  const repos = createRepositories(app.db);
  const services = createServices(repos);
  app.decorate("repos", repos);
  app.decorate("services", services);
}

function registerPlugins(app: FastifyInstance): void {
  app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024
    }
  });
}

function registerErrorHandlers(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    const { statusCode, code, message } = normalizeError(error);
    if (statusCode >= 500) {
      request.log.error(error);
    }
    reply.code(statusCode).send({ error: { code, message } });
  });

  app.setNotFoundHandler((request, reply) => {
    return reply.code(404).send({ error: { code: "NOT_FOUND", message: "Route not found" } });
  });
}

function normalizeError(
  error: Partial<AppError> & { validation?: unknown }
): { statusCode: number; code: string; message: string } {
  const statusCode =
    typeof error.statusCode === "number" ? error.statusCode : error.validation ? 400 : 500;
  const code =
    typeof error.code === "string"
      ? error.code
      : statusCode === 400
        ? "BAD_REQUEST"
        : "INTERNAL_SERVER_ERROR";
  const message = statusCode === 500 ? "Internal server error" : error.message || "Request failed";
  return { statusCode, code, message };
}
