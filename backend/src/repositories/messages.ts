export type MessageRecord = {
  id: string;
  thread_id: string;
  role: string;
  content: string;
  meta_json: string | null;
  created_at: string;
};

export type MessageInsert = {
  id: string;
  thread_id: string;
  role: string;
  content: string;
  meta_json?: string | null;
  created_at: string;
};

export type MessagesRepository = {
  insert: (record: MessageInsert) => MessageRecord;
  listByThread: (threadId: string) => MessageRecord[];
  listRecentByThread: (threadId: string, limit: number) => MessageRecord[];
};

const MESSAGE_FIELDS = "id, thread_id, role, content, meta_json, created_at";

export function createMessagesRepository(db: import("better-sqlite3").Database): MessagesRepository {
  return {
    insert(record: MessageInsert): MessageRecord {
      db.prepare(
        `INSERT INTO chat_message (id, thread_id, role, content, meta_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        record.id,
        record.thread_id,
        record.role,
        record.content,
        record.meta_json ?? null,
        record.created_at
      );
      return (
        db.prepare(`SELECT ${MESSAGE_FIELDS} FROM chat_message WHERE id = ?`).get(record.id) as
          | MessageRecord
          | undefined
      )!;
    },
    listByThread(threadId: string): MessageRecord[] {
      return db
        .prepare(
          `SELECT ${MESSAGE_FIELDS}
           FROM chat_message
           WHERE thread_id = ?
           ORDER BY created_at ASC`
        )
        .all(threadId) as MessageRecord[];
    },
    listRecentByThread(threadId: string, limit: number): MessageRecord[] {
      return db
        .prepare(
          `SELECT ${MESSAGE_FIELDS}
           FROM chat_message
           WHERE thread_id = ?
           ORDER BY created_at DESC
           LIMIT ?`
        )
        .all(threadId, limit) as MessageRecord[];
    }
  };
}
