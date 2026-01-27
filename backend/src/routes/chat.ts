import { FastifyInstance } from "fastify";
import { chatRequestSchema, chatResponseSchema } from "../schemas/chat";
import { errorResponseSchema } from "../schemas/errors";
import type { ChatSendRequest, ChatSendResponse } from "@shared/types/chat";

export function registerChatRoutes(app: FastifyInstance): void {
  app.post(
    "/api/chat",
    {
      schema: {
        body: chatRequestSchema,
        response: {
          200: chatResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<ChatSendResponse> => {
      const body = request.body as ChatSendRequest;
      return await app.services.chat.reply(body);
    }
  );
}
