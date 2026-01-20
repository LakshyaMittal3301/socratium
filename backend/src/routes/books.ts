import { FastifyInstance } from "fastify";
import { badRequest } from "../lib/errors";

const bookSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    source_filename: { type: "string" },
    pdf_path: { type: "string" },
    created_at: { type: "string" }
  },
  required: ["id", "title", "source_filename", "pdf_path", "created_at"]
};

const uploadResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" }
  },
  required: ["id"]
};

export function registerBookRoutes(app: FastifyInstance): void {
  app.get(
    "/api/books",
    {
      schema: {
        response: {
          200: { type: "array", items: bookSchema }
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
          200: uploadResponseSchema
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

      const result = await app.services.books.createFromUpload({
        filename,
        stream: file.file
      });

      return result;
    }
  );
}
