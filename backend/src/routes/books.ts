import { FastifyInstance } from "fastify";
import { badRequest } from "../lib/errors";
import {
  bookMetaSchema,
  bookSchema,
  outlineResponseSchema,
  uploadResponseSchema
} from "../schemas/books";
import { errorResponseSchema } from "../schemas/errors";
import type { UploadInput } from "../types/books";
import type { BookMetaResponse, BookOutlineResponse } from "@shared/types/api";
import { registerBookDebugRoutes } from "./books-debug";

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

  app.get(
    "/api/books/:bookId/file",
    {
      schema: {
        response: {
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      const { bookId } = request.params as { bookId: string };
      const pdfStream = app.services.books.getPdfStream(bookId);
      return reply.type("application/pdf").send(pdfStream);
    }
  );

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

  if (process.env.DEBUG_ENDPOINTS === "true") {
    registerBookDebugRoutes(app);
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
