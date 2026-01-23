import { FastifyInstance } from "fastify";
import { badRequest } from "../lib/errors";
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
      const pageNumber = Number(body.pageNumber);
      if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
        throw badRequest("Invalid page number");
      }
      return await app.services.chat.reply({
        threadId: body.threadId,
        pageNumber,
        message: body.message
      });
    }
  );
}
