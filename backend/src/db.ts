import Database from "better-sqlite3";
import path from "path";
import { getDataDir } from "./paths";

export type ProviderConfig = {
  id: string;
  name: string;
  provider_type: string;
  base_url: string;
  api_key_enc: string;
  model: string;
  created_at: string;
  updated_at: string;
};

export type BookRecord = {
  id: string;
  title: string;
  author: string;
  pdf_path: string;
  text_path: string;
  created_at: string;
};

export type SectionRecord = {
  id: string;
  book_id: string;
  title: string;
  order_index: number;
  start_page: number;
  end_page: number;
  start_offset: number;
  end_offset: number;
  summary: string | null;
  created_at: string;
};

export type PageMapRecord = {
  id: string;
  book_id: string;
  page_number: number;
  start_offset: number;
  end_offset: number;
};

export type ReadingProgressRecord = {
  id: string;
  book_id: string;
  current_section_id: string;
  current_page: number;
  last_seen_at: string;
};

const dbPath = path.join(getDataDir(), "app.db");
export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

export function initDb(): void {
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
      title TEXT,
      author TEXT,
      pdf_path TEXT,
      text_path TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS section (
      id TEXT PRIMARY KEY,
      book_id TEXT,
      title TEXT,
      order_index INTEGER,
      start_page INTEGER,
      end_page INTEGER,
      start_offset INTEGER,
      end_offset INTEGER,
      summary TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS page_map (
      id TEXT PRIMARY KEY,
      book_id TEXT,
      page_number INTEGER,
      start_offset INTEGER,
      end_offset INTEGER
    );

    CREATE TABLE IF NOT EXISTS reading_progress (
      id TEXT PRIMARY KEY,
      book_id TEXT,
      current_section_id TEXT,
      current_page INTEGER,
      last_seen_at TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_message (
      id TEXT PRIMARY KEY,
      book_id TEXT,
      section_id TEXT,
      role TEXT,
      message TEXT,
      message_type TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS user_answer (
      id TEXT PRIMARY KEY,
      section_id TEXT,
      question TEXT,
      answer TEXT,
      is_complete INTEGER,
      created_at TEXT
    );
  `);

  try {
    db.prepare("ALTER TABLE provider_config ADD COLUMN provider_type TEXT").run();
  } catch {
    // Column already exists.
  }
}
