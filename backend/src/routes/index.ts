import { FastifyInstance } from "fastify";
import { registerHealthRoutes } from "./health";
import { registerBookRoutes } from "./books";
import { registerChatRoutes } from "./chat";
import { registerProviderRoutes } from "./providers";
import { registerThreadRoutes } from "./threads";

export function registerRoutes(app: FastifyInstance): void {
  registerHealthRoutes(app);
  registerBookRoutes(app);
  registerChatRoutes(app);
  registerThreadRoutes(app);
  registerProviderRoutes(app);
}
