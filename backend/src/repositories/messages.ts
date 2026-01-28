export type MessageRecord = {
  id: string;
};

export type MessageInsert = {
  id: string;
};

export type MessagesRepository = {
  insert: (record: MessageInsert) => MessageRecord;
  listByThread: (threadId: string) => MessageRecord[];
  listRecentByThread: (threadId: string, limit: number) => MessageRecord[];
};

const MESSAGE_FIELDS = "id";

export function createMessagesRepository(db: import("better-sqlite3").Database): MessagesRepository {
  return {
    insert(record: MessageInsert): MessageRecord {
      db.prepare("INSERT INTO chat_message (id) VALUES (?)").run(record.id);
      return (
        db.prepare(`SELECT ${MESSAGE_FIELDS} FROM chat_message WHERE id = ?`).get(record.id) as
          | MessageRecord
          | undefined
      )!;
    },
    listByThread(threadId: string): MessageRecord[] {
      void threadId;
      return db
        .prepare(`SELECT ${MESSAGE_FIELDS} FROM chat_message`)
        .all() as MessageRecord[];
    },
    listRecentByThread(threadId: string, limit: number): MessageRecord[] {
      void threadId;
      return db
        .prepare(`SELECT ${MESSAGE_FIELDS} FROM chat_message LIMIT ?`)
        .all(limit) as MessageRecord[];
    }
  };
}
