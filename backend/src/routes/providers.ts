import { FastifyInstance } from "fastify";
import {
  createProviderSchema,
  openRouterModelsRequestSchema,
  openRouterModelsResponseSchema,
  providerListSchema,
  providerSchema,
  providerTestRequestSchema,
  providerTestResponseSchema
} from "../schemas/providers";
import { errorResponseSchema } from "../schemas/errors";
import type {
  CreateProviderRequest,
  ProviderDto,
  OpenRouterModelsRequest,
  OpenRouterModelsResponse,
  ProviderTestRequest,
  ProviderTestResponse
} from "@shared/types/providers";

export function registerProviderRoutes(app: FastifyInstance): void {
  app.get(
    "/api/providers",
    {
      schema: {
        response: {
          200: providerListSchema,
          500: errorResponseSchema
        }
      }
    },
    async () => app.services.providers.list()
  );

  app.post(
    "/api/providers",
    {
      schema: {
        body: createProviderSchema,
        response: {
          200: providerSchema,
          400: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<ProviderDto> => {
      const body = request.body as CreateProviderRequest;
      return app.services.providers.create({
        providerType: body.provider_type,
        name: body.name,
        model: body.model,
        apiKey: body.apiKey,
        baseUrl: body.baseUrl ?? null
      });
    }
  );

  app.post(
    "/api/providers/test",
    {
      schema: {
        body: providerTestRequestSchema,
        response: {
          200: providerTestResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<ProviderTestResponse> => {
      const body = request.body as ProviderTestRequest;
      const message = await app.services.providers.testKey({
        providerType: body.provider_type,
        model: body.model,
        apiKey: body.apiKey
      });
      return { ok: true, message };
    }
  );

  app.post(
    "/api/providers/openrouter/models",
    {
      schema: {
        body: openRouterModelsRequestSchema,
        response: {
          200: openRouterModelsResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<OpenRouterModelsResponse> => {
      const body = request.body as OpenRouterModelsRequest;
      const models = await app.services.providers.listOpenRouterModels(body.apiKey);
      return { data: models };
    }
  );

  app.patch(
    "/api/providers/:providerId/activate",
    {
      schema: {
        response: {
          200: providerSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<ProviderDto> => {
      const { providerId } = request.params as { providerId: string };
      return app.services.providers.setActive(providerId);
    }
  );

  app.delete(
    "/api/providers/:providerId",
    {
      schema: {
        response: {
          200: { type: "object", properties: { ok: { type: "boolean" } }, required: ["ok"] },
          500: errorResponseSchema
        }
      }
    },
    async (request) => {
      const { providerId } = request.params as { providerId: string };
      app.services.providers.remove(providerId);
      return { ok: true };
    }
  );
}
