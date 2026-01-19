import { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";
import { getBooksDir } from "../lib/paths";
import { insertBook, listBooks } from "../repositories/books";

function nowIso(): string {
  return new Date().toISOString();
}

function errorResponse(reply: any, statusCode: number, code: string, message: string) {
  reply.code(statusCode).send({ error: { code, message } });
}

export function registerBookRoutes(app: FastifyInstance): void {
  app.get("/api/books", async () => listBooks());

  app.post("/api/books/upload", async (request, reply) => {
    const file = await (request as any).file();
    if (!file) {
      return errorResponse(reply, 400, "BAD_REQUEST", "Missing PDF upload");
    }

    const filename = String(file.filename || "");
    if (!filename.toLowerCase().endsWith(".pdf")) {
      return errorResponse(reply, 400, "BAD_REQUEST", "Only PDF files are supported");
    }

    const bookId = crypto.randomUUID();
    const title = path.parse(filename).name;
    const pdfPath = path.join(getBooksDir(), `${bookId}.pdf`);

    await pipeline(file.file, fs.createWriteStream(pdfPath));

    insertBook({
      id: bookId,
      title,
      source_filename: filename,
      pdf_path: pdfPath,
      created_at: nowIso()
    });

    return { id: bookId };
  });
}
