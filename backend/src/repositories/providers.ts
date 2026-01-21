export type ProviderRecord = {
  id: string;
  name: string;
  provider_type: string;
  base_url: string | null;
  model: string;
  api_key_encrypted: string;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export type ProviderInsert = {
  id: string;
  name: string;
  provider_type: string;
  base_url?: string | null;
  model: string;
  api_key_encrypted: string;
  is_active?: number;
  created_at: string;
  updated_at: string;
};

export type ProvidersRepository = {
  insert: (record: ProviderInsert) => ProviderRecord;
  list: () => ProviderRecord[];
  getById: (id: string) => ProviderRecord | null;
  getActive: () => ProviderRecord | null;
  setActive: (id: string, activatedAt: string) => void;
  remove: (id: string) => void;
};

const PROVIDER_FIELDS =
  "id, name, provider_type, base_url, model, api_key_encrypted, is_active, created_at, updated_at";

export function createProvidersRepository(
  db: import("better-sqlite3").Database
): ProvidersRepository {
  return {
    insert(record: ProviderInsert): ProviderRecord {
      db.prepare(
        `INSERT INTO ai_provider (id, name, provider_type, base_url, model, api_key_encrypted, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        record.id,
        record.name,
        record.provider_type,
        record.base_url ?? null,
        record.model,
        record.api_key_encrypted,
        record.is_active ?? 0,
        record.created_at,
        record.updated_at
      );
      return (
        db.prepare(`SELECT ${PROVIDER_FIELDS} FROM ai_provider WHERE id = ?`).get(record.id) as
          | ProviderRecord
          | undefined
      )!;
    },
    list(): ProviderRecord[] {
      return db
        .prepare(`SELECT ${PROVIDER_FIELDS} FROM ai_provider ORDER BY created_at DESC`)
        .all() as ProviderRecord[];
    },
    getById(id: string): ProviderRecord | null {
      return (
        db.prepare(`SELECT ${PROVIDER_FIELDS} FROM ai_provider WHERE id = ?`).get(id) as
          | ProviderRecord
          | undefined
      ) ?? null;
    },
    getActive(): ProviderRecord | null {
      return (
        db.prepare(`SELECT ${PROVIDER_FIELDS} FROM ai_provider WHERE is_active = 1`).get() as
          | ProviderRecord
          | undefined
      ) ?? null;
    },
    setActive(id: string, activatedAt: string): void {
      const tx = db.transaction(() => {
        db.prepare("UPDATE ai_provider SET is_active = 0, updated_at = ? WHERE is_active = 1").run(
          activatedAt
        );
        db.prepare("UPDATE ai_provider SET is_active = 1, updated_at = ? WHERE id = ?").run(
          activatedAt,
          id
        );
      });
      tx();
    },
    remove(id: string): void {
      db.prepare("DELETE FROM ai_provider WHERE id = ?").run(id);
    }
  };
}
