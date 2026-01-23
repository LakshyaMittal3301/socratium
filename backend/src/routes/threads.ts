import { FastifyInstance } from "fastify";
import { errorResponseSchema } from "../schemas/errors";
import {
  threadListSchema,
  threadSchema,
  updateThreadSchema,
  chatMessageListSchema
} from "../schemas/threads";
import type {
  ThreadListResponse,
  CreateThreadResponse,
  UpdateThreadRequest,
  MessageListResponse
} from "@shared/types/chat";

export function registerThreadRoutes(app: FastifyInstance): void {
  app.get(
    "/api/books/:bookId/threads",
    {
      schema: {
        response: {
          200: threadListSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<ThreadListResponse> => {
      const { bookId } = request.params as { bookId: string };
      return app.services.chat.listThreads(bookId);
    }
  );

  app.post(
    "/api/books/:bookId/threads",
    {
      schema: {
        response: {
          200: threadSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<CreateThreadResponse> => {
      const { bookId } = request.params as { bookId: string };
      return app.services.chat.createThread(bookId);
    }
  );

  app.patch(
    "/api/threads/:threadId",
    {
      schema: {
        body: updateThreadSchema,
        response: {
          200: threadSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<CreateThreadResponse> => {
      const { threadId } = request.params as { threadId: string };
      const body = request.body as UpdateThreadRequest;
      return app.services.chat.renameThread(threadId, body.title);
    }
  );

  app.delete(
    "/api/threads/:threadId",
    {
      schema: {
        response: {
          200: { type: "object", properties: { ok: { type: "boolean" } }, required: ["ok"] },
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request) => {
      const { threadId } = request.params as { threadId: string };
      app.services.chat.removeThread(threadId);
      return { ok: true };
    }
  );

  app.get(
    "/api/threads/:threadId/messages",
    {
      schema: {
        response: {
          200: chatMessageListSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<MessageListResponse> => {
      const { threadId } = request.params as { threadId: string };
      return app.services.chat.listMessages(threadId);
    }
  );
}
