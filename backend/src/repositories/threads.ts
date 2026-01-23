export type ThreadRecord = {
  id: string;
  book_id: string;
  title: string | null;
  provider_id: string;
  provider_name: string | null;
  provider_type: string | null;
  model: string | null;
  provider_is_active: number | null;
  created_at: string;
  updated_at: string;
};

export type ThreadInsert = {
  id: string;
  book_id: string;
  title?: string | null;
  provider_id: string;
  created_at: string;
  updated_at: string;
};

export type ThreadsRepository = {
  insert: (record: ThreadInsert) => ThreadRecord;
  listByBook: (bookId: string) => ThreadRecord[];
  getById: (id: string) => ThreadRecord | null;
  updateTitle: (id: string, title: string, updatedAt: string) => void;
  touchUpdatedAt: (id: string, updatedAt: string) => void;
  remove: (id: string) => void;
};

const THREAD_FIELDS = `
  t.id,
  t.book_id,
  t.title,
  t.provider_id,
  t.created_at,
  t.updated_at,
  p.name as provider_name,
  p.provider_type as provider_type,
  p.model as model,
  p.is_active as provider_is_active
`;

export function createThreadsRepository(db: import("better-sqlite3").Database): ThreadsRepository {
  return {
    insert(record: ThreadInsert): ThreadRecord {
      db.prepare(
        `INSERT INTO chat_thread (id, book_id, title, provider_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        record.id,
        record.book_id,
        record.title ?? null,
        record.provider_id,
        record.created_at,
        record.updated_at
      );
      return (
        db.prepare(`SELECT ${THREAD_FIELDS} FROM chat_thread t LEFT JOIN ai_provider p ON p.id = t.provider_id WHERE t.id = ?`).get(record.id) as
          | ThreadRecord
          | undefined
      )!;
    },
    listByBook(bookId: string): ThreadRecord[] {
      return db
        .prepare(
          `SELECT ${THREAD_FIELDS}
           FROM chat_thread t
           LEFT JOIN ai_provider p ON p.id = t.provider_id
           WHERE t.book_id = ?
           ORDER BY t.updated_at DESC, t.created_at DESC`
        )
        .all(bookId) as ThreadRecord[];
    },
    getById(id: string): ThreadRecord | null {
      return (
        db
          .prepare(
            `SELECT ${THREAD_FIELDS}
             FROM chat_thread t
             LEFT JOIN ai_provider p ON p.id = t.provider_id
             WHERE t.id = ?`
          )
          .get(id) as ThreadRecord | undefined
      ) ?? null;
    },
    updateTitle(id: string, title: string, updatedAt: string): void {
      db.prepare("UPDATE chat_thread SET title = ?, updated_at = ? WHERE id = ?").run(
        title,
        updatedAt,
        id
      );
    },
    touchUpdatedAt(id: string, updatedAt: string): void {
      db.prepare("UPDATE chat_thread SET updated_at = ? WHERE id = ?").run(updatedAt, id);
    },
    remove(id: string): void {
      db.prepare("DELETE FROM chat_thread WHERE id = ?").run(id);
    }
  };
}
