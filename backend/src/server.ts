import Fastify from "fastify";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { initDb, db, SectionRecord, BookRecord } from "./db";
import { encrypt } from "./crypto";
import { extractPdfText, buildPageMap, buildSections } from "./pdf";
import { callChat } from "./ai";
import { getBooksDir, getDataDir, getRepoRoot } from "./paths";

const app = Fastify({ logger: true });

const PAGES_PER_SECTION = 4;
const DEFAULT_BOOK_ID = "ddia";
const DEFAULT_BOOK_TITLE = "Designing Data-Intensive Applications";
const DEFAULT_BOOK_AUTHOR = "Martin Kleppmann";

const textCache = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function loadText(textPath: string): string {
  const cached = textCache.get(textPath);
  if (cached) return cached;
  const data = fs.readFileSync(textPath, "utf8");
  textCache.set(textPath, data);
  return data;
}

function getSectionText(book: BookRecord, section: SectionRecord): string {
  const text = loadText(book.text_path);
  return text.slice(section.start_offset, section.end_offset);
}

async function ingestPdf(params: {
  bookId: string;
  title: string;
  author: string;
  sourcePdfPath: string;
}): Promise<{ bookId: string }>{
  const { bookId, title, author, sourcePdfPath } = params;
  const booksDir = getBooksDir();
  ensureDir(booksDir);

  const pdfPath = path.join(booksDir, `${bookId}.pdf`);
  fs.copyFileSync(sourcePdfPath, pdfPath);

  const { text, pages } = await extractPdfText(pdfPath);
  const pageMap = buildPageMap(pages);
  const sections = buildSections(pages, pageMap, PAGES_PER_SECTION);

  const textPath = path.join(booksDir, `${bookId}.txt`);
  fs.writeFileSync(textPath, text, "utf8");
  textCache.set(textPath, text);

  const createdAt = nowIso();

  const tx = db.transaction(() => {
    db.prepare("DELETE FROM section WHERE book_id = ?").run(bookId);
    db.prepare("DELETE FROM page_map WHERE book_id = ?").run(bookId);
    db.prepare(
      `INSERT INTO book (id, title, author, pdf_path, text_path, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         author = excluded.author,
         pdf_path = excluded.pdf_path,
         text_path = excluded.text_path`
    ).run(bookId, title, author, pdfPath, textPath, createdAt);

    const insertPage = db.prepare(
      `INSERT INTO page_map (id, book_id, page_number, start_offset, end_offset)
       VALUES (?, ?, ?, ?, ?)`
    );

    pageMap.forEach((entry, index) => {
      insertPage.run(crypto.randomUUID(), bookId, index + 1, entry.start, entry.end);
    });

    const insertSection = db.prepare(
      `INSERT INTO section
       (id, book_id, title, order_index, start_page, end_page, start_offset, end_offset, summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    sections.forEach((section, index) => {
      insertSection.run(
        crypto.randomUUID(),
        bookId,
        section.title,
        index,
        section.startPage,
        section.endPage,
        section.startOffset,
        section.endOffset,
        null,
        createdAt
      );
    });
  });

  tx();
  return { bookId };
}

async function ensureDefaultBook(): Promise<void> {
  const existing = db.prepare("SELECT id FROM book WHERE id = ?").get(DEFAULT_BOOK_ID);
  if (existing) return;

  const repoRoot = getRepoRoot();
  const defaultPdf = path.join(
    repoRoot,
    "Kleppmann, Martin - Designing data-intensive applications_ the big ideas behind reliable, scalable, and maintainable systems (2018, O'Reilly Media) - libgen.li_unlocked.pdf"
  );

  if (!fs.existsSync(defaultPdf)) {
    app.log.warn("Default PDF not found; upload required.");
    return;
  }

  await ingestPdf({
    bookId: DEFAULT_BOOK_ID,
    title: DEFAULT_BOOK_TITLE,
    author: DEFAULT_BOOK_AUTHOR,
    sourcePdfPath: defaultPdf
  });
}

function errorResponse(reply: any, statusCode: number, code: string, message: string) {
  reply.code(statusCode).send({ error: { code, message } });
}

app.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

app.register(fastifyStatic, {
  root: path.join(getRepoRoot(), "frontend"),
  prefix: "/"
});

app.get("/api/health", async () => ({ status: "ok" }));

app.get("/api/provider", async () => {
  const row = db.prepare("SELECT * FROM provider_config LIMIT 1").get() as any;
  if (!row) return { configured: false };
  return {
    configured: true,
    name: row.name,
    providerType: row.provider_type ?? "openai",
    baseUrl: row.base_url,
    model: row.model,
    hasKey: Boolean(row.api_key_enc)
  };
});

app.post("/api/provider", async (request, reply) => {
  const body = request.body as any;
  const providerType = body.providerType === "gemini" ? "gemini" : "openai";
  const baseUrl = (body.baseUrl || "").trim();
  const model = (body.model || "").trim();

  const defaults =
    providerType === "gemini"
      ? {
          baseUrl: "https://generativelanguage.googleapis.com/v1beta",
          model: "gemini-3-flash-preview"
        }
      : {
          baseUrl: "https://api.openai.com",
          model: "gpt-4o-mini"
        };

  const resolvedBaseUrl = baseUrl || defaults.baseUrl;
  const resolvedModel = model || defaults.model;

  if (!resolvedBaseUrl || !resolvedModel) {
    return errorResponse(reply, 400, "BAD_REQUEST", "Missing provider baseUrl or model");
  }

  const id = "default";
  const createdAt = nowIso();
  const apiKeyEnc = body.apiKey ? encrypt(body.apiKey) : "";

  db.prepare(
    `INSERT INTO provider_config (id, name, provider_type, base_url, api_key_enc, model, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       provider_type = excluded.provider_type,
       base_url = excluded.base_url,
       api_key_enc = excluded.api_key_enc,
       model = excluded.model,
       updated_at = excluded.updated_at`
  ).run(
    id,
    body.name ?? "",
    providerType,
    resolvedBaseUrl,
    apiKeyEnc,
    resolvedModel,
    createdAt,
    createdAt
  );

  return { ok: true };
});

app.post("/api/provider/test", async (request, reply) => {
  try {
    const message = await callChat([
      { role: "system", content: "You are a connectivity test. Respond with 'ok'." },
      { role: "user", content: "ping" }
    ]);
    return { ok: true, message };
  } catch (error: any) {
    return errorResponse(reply, 400, "PROVIDER_ERROR", error.message ?? "Provider error");
  }
});

app.get("/api/books", async () => {
  const rows = db.prepare("SELECT id, title, author FROM book ORDER BY created_at").all();
  return rows;
});

app.get("/api/books/:bookId", async (request, reply) => {
  const { bookId } = request.params as any;
  const row = db.prepare("SELECT * FROM book WHERE id = ?").get(bookId);
  if (!row) {
    return errorResponse(reply, 404, "NOT_FOUND", "Book not found");
  }
  return row;
});

app.get("/api/books/:bookId/pdf", async (request, reply) => {
  const { bookId } = request.params as any;
  const row = db.prepare("SELECT pdf_path FROM book WHERE id = ?").get(bookId) as any;
  if (!row) {
    return errorResponse(reply, 404, "NOT_FOUND", "Book not found");
  }
  if (!fs.existsSync(row.pdf_path)) {
    return errorResponse(reply, 404, "NOT_FOUND", "PDF not found");
  }
  reply.type("application/pdf");
  return reply.send(fs.createReadStream(row.pdf_path));
});

app.post("/api/books/upload", async (request, reply) => {
  const data = await (request as any).file();
  if (!data) {
    return errorResponse(reply, 400, "BAD_REQUEST", "Missing PDF upload");
  }
  if (!data.filename.toLowerCase().endsWith(".pdf")) {
    return errorResponse(reply, 400, "BAD_REQUEST", "Only PDF files are supported");
  }

  const uploadsDir = path.join(getDataDir(), "uploads");
  ensureDir(uploadsDir);
  const tempPath = path.join(uploadsDir, `${crypto.randomUUID()}.pdf`);
  const buffer = await data.toBuffer();
  fs.writeFileSync(tempPath, buffer);

  const bookId = `book-${Date.now()}`;
  await ingestPdf({
    bookId,
    title: data.filename.replace(/\.pdf$/i, ""),
    author: "",
    sourcePdfPath: tempPath
  });

  return { id: bookId };
});

app.get("/api/books/:bookId/sections", async (request, reply) => {
  const { bookId } = request.params as any;
  const rows = db
    .prepare("SELECT * FROM section WHERE book_id = ? ORDER BY order_index")
    .all(bookId);
  if (!rows.length) {
    return errorResponse(reply, 404, "NOT_FOUND", "No sections found");
  }
  return rows;
});

app.get("/api/sections/:sectionId", async (request, reply) => {
  const { sectionId } = request.params as any;
  const row = db.prepare("SELECT * FROM section WHERE id = ?").get(sectionId);
  if (!row) {
    return errorResponse(reply, 404, "NOT_FOUND", "Section not found");
  }
  return row;
});

app.get("/api/books/:bookId/pages/:pageNumber/section", async (request, reply) => {
  const { bookId, pageNumber } = request.params as any;
  const page = Number(pageNumber);
  const row = db
    .prepare(
      "SELECT * FROM section WHERE book_id = ? AND start_page <= ? AND end_page >= ? LIMIT 1"
    )
    .get(bookId, page, page);
  if (!row) {
    return errorResponse(reply, 404, "NOT_FOUND", "Section not found for page");
  }
  return row;
});

app.get("/api/reading/:bookId", async (request) => {
  const { bookId } = request.params as any;
  const row = db.prepare("SELECT * FROM reading_progress WHERE book_id = ?").get(bookId) as any;
  if (row) {
    return {
      currentPage: row.current_page,
      currentSectionId: row.current_section_id
    };
  }

  const firstSection = db
    .prepare("SELECT id, start_page FROM section WHERE book_id = ? ORDER BY order_index LIMIT 1")
    .get(bookId) as any;

  return {
    currentPage: firstSection?.start_page ?? 1,
    currentSectionId: firstSection?.id ?? null
  };
});

app.post("/api/reading/:bookId", async (request, reply) => {
  const { bookId } = request.params as any;
  const body = request.body as any;
  if (!body?.currentPage || !body?.currentSectionId) {
    return errorResponse(reply, 400, "BAD_REQUEST", "Missing currentPage or currentSectionId");
  }

  const id = bookId;
  const lastSeen = nowIso();

  db.prepare(
    `INSERT INTO reading_progress (id, book_id, current_section_id, current_page, last_seen_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       current_section_id = excluded.current_section_id,
       current_page = excluded.current_page,
       last_seen_at = excluded.last_seen_at`
  ).run(id, bookId, body.currentSectionId, body.currentPage, lastSeen);

  return { ok: true };
});

app.post("/api/chat/intro", async (request, reply) => {
  const body = request.body as any;
  if (!body?.sectionId || !body?.bookId) {
    return errorResponse(reply, 400, "BAD_REQUEST", "Missing bookId or sectionId");
  }

  const section = db.prepare("SELECT * FROM section WHERE id = ?").get(body.sectionId) as SectionRecord;
  const book = db.prepare("SELECT * FROM book WHERE id = ?").get(body.bookId) as BookRecord;
  if (!section || !book) {
    return errorResponse(reply, 404, "NOT_FOUND", "Section or book not found");
  }

  const sectionText = getSectionText(book, section).slice(0, 8000);

  const prompt = [
    "You are a Socratic reading companion.",
    "Introduce the section with a short, concrete problem or question.",
    "Keep it to 1-3 sentences.",
    "Section text:",
    sectionText,
    "User thoughts (if any):",
    body.userPrompt ?? "(none)"
  ].join("\n\n");

  try {
    const message = await callChat([
      { role: "system", content: "You are concise and focused." },
      { role: "user", content: prompt }
    ]);

    const createdAt = nowIso();
    db.prepare(
      "INSERT INTO chat_message (id, book_id, section_id, role, message, message_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(crypto.randomUUID(), body.bookId, body.sectionId, "assistant", message, "intro", createdAt);

    return { message };
  } catch (error: any) {
    return errorResponse(reply, 400, "PROVIDER_ERROR", error.message ?? "Provider error");
  }
});

app.post("/api/chat/practice", async (request, reply) => {
  const body = request.body as any;
  if (!body?.sectionId || !body?.bookId) {
    return errorResponse(reply, 400, "BAD_REQUEST", "Missing bookId or sectionId");
  }

  const section = db.prepare("SELECT * FROM section WHERE id = ?").get(body.sectionId) as SectionRecord;
  const book = db.prepare("SELECT * FROM book WHERE id = ?").get(body.bookId) as BookRecord;
  if (!section || !book) {
    return errorResponse(reply, 404, "NOT_FOUND", "Section or book not found");
  }

  const sectionText = getSectionText(book, section).slice(0, 9000);

  const prompt = [
    "You are a Socratic tutor.",
    "Create 2 to 4 retrieval-practice questions based on the section.",
    "Make them varied (definition, application, compare/contrast).",
    "Section text:",
    sectionText
  ].join("\n\n");

  try {
    const message = await callChat([
      { role: "system", content: "You ask clear, short questions." },
      { role: "user", content: prompt }
    ]);

    const createdAt = nowIso();
    db.prepare(
      "INSERT INTO chat_message (id, book_id, section_id, role, message, message_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(crypto.randomUUID(), body.bookId, body.sectionId, "assistant", message, "practice", createdAt);

    return { message };
  } catch (error: any) {
    return errorResponse(reply, 400, "PROVIDER_ERROR", error.message ?? "Provider error");
  }
});

app.post("/api/chat/adhoc", async (request, reply) => {
  const body = request.body as any;
  if (!body?.sectionId || !body?.bookId || !body?.question) {
    return errorResponse(reply, 400, "BAD_REQUEST", "Missing bookId, sectionId, or question");
  }

  const section = db.prepare("SELECT * FROM section WHERE id = ?").get(body.sectionId) as SectionRecord;
  const book = db.prepare("SELECT * FROM book WHERE id = ?").get(body.bookId) as BookRecord;
  if (!section || !book) {
    return errorResponse(reply, 404, "NOT_FOUND", "Section or book not found");
  }

  const sectionText = getSectionText(book, section).slice(0, 9000);

  const prompt = [
    "Answer the user's question using the section context.",
    "If the context is insufficient, say so and answer generally.",
    "Section text:",
    sectionText,
    "User question:",
    body.question
  ].join("\n\n");

  try {
    const message = await callChat([
      { role: "system", content: "You answer succinctly." },
      { role: "user", content: prompt }
    ]);

    const createdAt = nowIso();
    db.prepare(
      "INSERT INTO chat_message (id, book_id, section_id, role, message, message_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(crypto.randomUUID(), body.bookId, body.sectionId, "assistant", message, "adhoc", createdAt);

    return { message };
  } catch (error: any) {
    return errorResponse(reply, 400, "PROVIDER_ERROR", error.message ?? "Provider error");
  }
});

app.post("/api/chat/answer", async (request, reply) => {
  const body = request.body as any;
  if (!body?.sectionId || !body?.question || !body?.answer) {
    return errorResponse(reply, 400, "BAD_REQUEST", "Missing sectionId, question, or answer");
  }

  const section = db.prepare("SELECT * FROM section WHERE id = ?").get(body.sectionId) as SectionRecord;
  if (!section) {
    return errorResponse(reply, 404, "NOT_FOUND", "Section not found");
  }

  const createdAt = nowIso();
  db.prepare(
    "INSERT INTO user_answer (id, section_id, question, answer, is_complete, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(crypto.randomUUID(), body.sectionId, body.question, body.answer, body.isComplete ? 1 : 0, createdAt);

  db.prepare(
    "INSERT INTO chat_message (id, book_id, section_id, role, message, message_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    crypto.randomUUID(),
    section.book_id,
    body.sectionId,
    "user",
    body.answer,
    "feedback",
    createdAt
  );

  return { ok: true };
});

app.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith("/api")) {
    return errorResponse(reply, 404, "NOT_FOUND", "Route not found");
  }
  return reply.sendFile("index.html");
});

async function start() {
  initDb();
  await ensureDefaultBook();
  const port = Number(process.env.PORT ?? 8787);
  await app.listen({ port, host: "127.0.0.1" });
}

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
