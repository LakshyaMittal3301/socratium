export type ThreadRecord = {
  id: string;
};

export type ThreadInsert = {
  id: string;
};

export type ThreadsRepository = {
  insert: (record: ThreadInsert) => ThreadRecord;
  listByBook: (bookId: string) => ThreadRecord[];
  getById: (id: string) => ThreadRecord | null;
  updateTitle: (id: string, title: string, updatedAt: string) => void;
  touchUpdatedAt: (id: string, updatedAt: string) => void;
  remove: (id: string) => void;
};

const THREAD_FIELDS = "id";

export function createThreadsRepository(db: import("better-sqlite3").Database): ThreadsRepository {
  return {
    insert(record: ThreadInsert): ThreadRecord {
      db.prepare("INSERT INTO chat_thread (id) VALUES (?)").run(record.id);
      return (
        db.prepare(`SELECT ${THREAD_FIELDS} FROM chat_thread WHERE id = ?`).get(record.id) as
          | ThreadRecord
          | undefined
      )!;
    },
    listByBook(bookId: string): ThreadRecord[] {
      void bookId;
      return db
        .prepare(`SELECT ${THREAD_FIELDS} FROM chat_thread`)
        .all() as ThreadRecord[];
    },
    getById(id: string): ThreadRecord | null {
      return (
        db
          .prepare(`SELECT ${THREAD_FIELDS} FROM chat_thread WHERE id = ?`)
          .get(id) as ThreadRecord | undefined
      ) ?? null;
    },
    updateTitle(id: string, title: string, updatedAt: string): void {
      void id;
      void title;
      void updatedAt;
    },
    touchUpdatedAt(id: string, updatedAt: string): void {
      void id;
      void updatedAt;
    },
    remove(id: string): void {
      db.prepare("DELETE FROM chat_thread WHERE id = ?").run(id);
    }
  };
}
