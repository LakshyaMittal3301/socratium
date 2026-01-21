import { FastifyInstance } from "fastify";
import { badRequest } from "../lib/errors";
import { normalizeLimit } from "../lib/limits";
import {
  outlineResponseSchema,
  pageMapResponseSchema,
  pageTextResponseSchema,
  textSampleSchema
} from "../schemas/books";
import { errorResponseSchema } from "../schemas/errors";
import type { BookOutlineResponse, BookTextSampleResponse, PageMapResponse, PageTextResponse } from "@shared/types/api";
import { DEFAULT_DEBUG_LIMIT, MAX_DEBUG_LIMIT } from "../lib/config";

export function registerBookDebugRoutes(app: FastifyInstance): void {
  app.get(
    "/api/debug/books/:bookId/text",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            limit: { type: "number" }
          }
        },
        response: {
          200: textSampleSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<BookTextSampleResponse> => {
      const { bookId } = request.params as { bookId: string };
      const limitRaw = (request.query as { limit?: number }).limit;
      const limit = normalizeLimit(limitRaw, DEFAULT_DEBUG_LIMIT, MAX_DEBUG_LIMIT);
      return app.services.books.getTextSample(bookId, limit);
    }
  );

  app.get(
    "/api/debug/books/:bookId/outline",
    {
      schema: {
        response: {
          200: outlineResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<BookOutlineResponse> => {
      const { bookId } = request.params as { bookId: string };
      return app.services.books.getOutline(bookId);
    }
  );

  app.get(
    "/api/debug/books/:bookId/page-map",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            limit: { type: "number" }
          }
        },
        response: {
          200: pageMapResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<PageMapResponse> => {
      const { bookId } = request.params as { bookId: string };
      const limitRaw = (request.query as { limit?: number }).limit;
      const limit = normalizeLimit(limitRaw, DEFAULT_DEBUG_LIMIT, MAX_DEBUG_LIMIT);
      return app.services.books.getPageMap(bookId, limit);
    }
  );

  app.get(
    "/api/debug/books/:bookId/pages/:pageNumber/text",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            bookId: { type: "string" },
            pageNumber: { type: "string" }
          },
          required: ["bookId", "pageNumber"]
        },
        response: {
          200: pageTextResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<PageTextResponse> => {
      const { bookId, pageNumber } = request.params as { bookId: string; pageNumber: string };
      const resolvedPage = parsePageNumber(pageNumber);
      return app.services.books.getPageText(bookId, resolvedPage);
    }
  );
}

function parsePageNumber(value: string): number {
  const resolvedPage = Number(value);
  if (!Number.isInteger(resolvedPage) || resolvedPage <= 0) {
    throw badRequest("Invalid page number");
  }
  return resolvedPage;
}
