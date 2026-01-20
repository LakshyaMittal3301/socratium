import Database from "better-sqlite3";
import path from "path";
import { getDataDir } from "../lib/paths";

const SCHEMA_VERSION = 4;
const dbPath = path.join(getDataDir(), "socratium.db");
export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDb(): void {
  const currentVersion = db.pragma("user_version", { simple: true }) as number;
  if (currentVersion !== SCHEMA_VERSION) {
    db.exec(`
      DROP TABLE IF EXISTS page_map;
      DROP TABLE IF EXISTS app_meta;
      DROP TABLE IF EXISTS book;
    `);
  }

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
      FOREIGN KEY(book_id) REFERENCES book(id)
    );
  `);

  db.pragma(`user_version = ${SCHEMA_VERSION}`);
}
