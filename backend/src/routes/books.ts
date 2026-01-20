import { FastifyInstance } from "fastify";
import { badRequest } from "../lib/errors";
import {
  bookMetaSchema,
  bookSchema,
  outlineResponseSchema,
  textSampleSchema,
  uploadResponseSchema
} from "../schemas/books";
import { errorResponseSchema } from "../schemas/errors";
import type { UploadInput } from "../types/books";
import type { BookMetaResponse, BookOutlineResponse, BookTextSampleResponse } from "@shared/types/api";

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

  // Debug endpoint for verifying extracted text output.
  app.get(
    "/api/books/:bookId/text",
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

  // Debug endpoint for verifying extracted outline data.
  app.get(
    "/api/books/:bookId/outline",
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

function normalizeLimit(value?: number): number {
  const fallback = 2000;
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(value, 20000));
}
