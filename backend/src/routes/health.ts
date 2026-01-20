import { FastifyInstance } from "fastify";
import type { HealthResponse } from "@shared/types/api";
import { errorResponseSchema } from "../schemas/errors";

export function registerHealthRoutes(app: FastifyInstance): void {
  app.get(
    "/api/health",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: { status: { type: "string" } },
            required: ["status"]
          },
          500: errorResponseSchema
        }
      }
    },
    async (): Promise<HealthResponse> => ({ status: "ok" })
  );
}
