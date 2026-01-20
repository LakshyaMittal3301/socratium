import { FastifyInstance } from "fastify";
import { registerHealthRoutes } from "./health";
import { registerBookRoutes } from "./books";

export function registerRoutes(app: FastifyInstance): void {
  registerHealthRoutes(app);
  registerBookRoutes(app);
}
