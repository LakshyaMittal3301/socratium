import Database from "better-sqlite3";
import path from "path";
import { getDataDir } from "../lib/paths";

const SCHEMA_VERSION = 7;
const dbPath = path.join(getDataDir(), "socratium.db");
export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDb(): void {
  const currentVersion = db.pragma("user_version", { simple: true }) as number;
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS book (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      source_filename TEXT NOT NULL,
      pdf_path TEXT NOT NULL,
      text_path TEXT,
      outline_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS page_map (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      page_number INTEGER NOT NULL,
      start_offset INTEGER NOT NULL,
      end_offset INTEGER NOT NULL,
      FOREIGN KEY(book_id) REFERENCES book(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_provider (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider_type TEXT NOT NULL,
      base_url TEXT,
      model TEXT NOT NULL,
      api_key_encrypted TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS ai_provider_single_active
      ON ai_provider(is_active)
      WHERE is_active = 1;

    CREATE TABLE IF NOT EXISTS chat_thread (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      title TEXT,
      provider_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(book_id) REFERENCES book(id) ON DELETE CASCADE,
      FOREIGN KEY(provider_id) REFERENCES ai_provider(id)
    );

    CREATE INDEX IF NOT EXISTS chat_thread_book_created_at
      ON chat_thread(book_id, created_at);

    CREATE TABLE IF NOT EXISTS chat_message (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      meta_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(thread_id) REFERENCES chat_thread(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS chat_message_thread_created_at
      ON chat_message(thread_id, created_at);
  `);

  if (currentVersion !== SCHEMA_VERSION) {
    db.pragma(`user_version = ${SCHEMA_VERSION}`);
  }
}
