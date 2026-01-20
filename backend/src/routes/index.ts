import { FastifyInstance } from "fastify";
import { registerHealthRoutes } from "./health";
import { registerBookRoutes } from "./books";
import { registerChatRoutes } from "./chat";
import { registerProviderRoutes } from "./providers";

export function registerRoutes(app: FastifyInstance): void {
  registerHealthRoutes(app);
  registerBookRoutes(app);
  registerChatRoutes(app);
  registerProviderRoutes(app);
}
