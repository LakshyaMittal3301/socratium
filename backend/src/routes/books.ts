import { FastifyInstance } from "fastify";
import { badRequest } from "../lib/errors";
import { bookSchema, uploadResponseSchema } from "../schemas/books";
import { errorResponseSchema } from "../schemas/errors";
import type { UploadInput } from "../types/books";

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
