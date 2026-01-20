import { FastifyInstance } from "fastify";
import { badRequest } from "../lib/errors";
import { normalizeLimit } from "../lib/limits";
import {
  bookMetaSchema,
  bookSchema,
  outlineResponseSchema,
  pageMapResponseSchema,
  pageTextResponseSchema,
  textSampleSchema,
  uploadResponseSchema
} from "../schemas/books";
import { errorResponseSchema } from "../schemas/errors";
import type { UploadInput } from "../types/books";
import type {
  BookMetaResponse,
  BookOutlineResponse,
  BookTextSampleResponse,
  PageMapResponse,
  PageTextResponse
} from "@shared/types/api";

export function registerBookRoutes(app: FastifyInstance): void {
  app.get(
    "/api/books",
    {
      schema: {
        response: {
          200: { type: "array", items: bookSchema },
          400: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async () => app.services.books.list()
  );

  app.get(
    "/api/books/:bookId",
    {
      schema: {
        response: {
          200: bookMetaSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request): Promise<BookMetaResponse> => {
      const { bookId } = request.params as { bookId: string };
      return app.services.books.getMeta(bookId);
    }
  );

  if (process.env.DEBUG_ENDPOINTS === "true") {
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
        const limit = normalizeLimit(limitRaw);
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
        const limit = normalizeLimit(limitRaw);
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
        const resolvedPage = Number(pageNumber);
        if (!Number.isInteger(resolvedPage) || resolvedPage <= 0) {
          throw badRequest("Invalid page number");
        }
        return app.services.books.getPageText(bookId, resolvedPage);
      }
    );
  }

  app.post(
    "/api/books/upload",
    {
      schema: {
        consumes: ["multipart/form-data"],
        response: {
          200: uploadResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request) => {
      const file = await (request as any).file();
      if (!file) {
        throw badRequest("Missing PDF upload");
      }

      const filename = String(file.filename || "");
      if (!filename.toLowerCase().endsWith(".pdf")) {
        throw badRequest("Only PDF files are supported");
      }

      const input: UploadInput = {
        filename,
        stream: file.file
      };

      const result = await app.services.books.createFromUpload(input);

      return result;
    }
  );
}
