import Database from "better-sqlite3";
import path from "path";
import { getDataDir } from "./paths";

const SCHEMA_VERSION = 1;
const dbPath = path.join(getDataDir(), "socratium.db");
export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDb(): void {
  const currentVersion = db.pragma("user_version", { simple: true }) as number;
  if (currentVersion !== SCHEMA_VERSION) {
    db.exec(`
      DROP TABLE IF EXISTS user_answer;
      DROP TABLE IF EXISTS chat_message;
      DROP TABLE IF EXISTS reading_progress;
      DROP TABLE IF EXISTS section;
      DROP TABLE IF EXISTS book;
      DROP TABLE IF EXISTS provider_config;
    `);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS provider_config (
      id TEXT PRIMARY KEY,
      name TEXT,
      provider_type TEXT,
      base_url TEXT,
      api_key_enc TEXT,
      model TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS book (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT,
      pdf_path TEXT NOT NULL,
      text_path TEXT NOT NULL,
      outline_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS section (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      depth INTEGER NOT NULL DEFAULT 0,
      parent_section_id TEXT,
      source TEXT NOT NULL DEFAULT 'toc',
      start_page INTEGER NOT NULL,
      end_page INTEGER NOT NULL,
      start_offset INTEGER NOT NULL,
      end_offset INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'not_started',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(book_id) REFERENCES book(id),
      FOREIGN KEY(parent_section_id) REFERENCES section(id)
    );

    CREATE TABLE IF NOT EXISTS reading_progress (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      current_section_id TEXT,
      current_page INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(book_id) REFERENCES book(id),
      FOREIGN KEY(current_section_id) REFERENCES section(id)
    );

    CREATE TABLE IF NOT EXISTS chat_message (
      id TEXT PRIMARY KEY,
      section_id TEXT NOT NULL,
      role TEXT NOT NULL,
      message TEXT NOT NULL,
      message_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(section_id) REFERENCES section(id)
    );

    CREATE TABLE IF NOT EXISTS user_answer (
      id TEXT PRIMARY KEY,
      section_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(section_id) REFERENCES section(id)
    );
  `);

  db.pragma(`user_version = ${SCHEMA_VERSION}`);
}
