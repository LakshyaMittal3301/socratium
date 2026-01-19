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
      DROP TABLE IF EXISTS app_meta;
    `);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  db.pragma(`user_version = ${SCHEMA_VERSION}`);
}
