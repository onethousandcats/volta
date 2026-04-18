import { openDB, type DBSchema } from "idb";
import type { MailboxMessage, MailboxThread, SyncMetadata } from "../../types/gmail";

interface VoltaDbSchema extends DBSchema {
  messages: {
    key: string;
    value: MailboxMessage;
    indexes: {
      "by-internal-date": number;
      "by-threadId": string;
    };
  };
  syncMeta: {
    key: string;
    value: SyncMetadata;
  };
  threads: {
    key: string;
    value: MailboxThread;
    indexes: {
      "by-internal-date": number;
      "by-last-updated": number;
    };
  };
}

const dbPromise = openDB<VoltaDbSchema>("volta", 1, {
  upgrade(database) {
    const threadStore = database.createObjectStore("threads", {
      keyPath: "id",
    });
    threadStore.createIndex("by-internal-date", "internalDate");
    threadStore.createIndex("by-last-updated", "lastUpdated");

    const messageStore = database.createObjectStore("messages", {
      keyPath: "id",
    });
    messageStore.createIndex("by-threadId", "threadId");
    messageStore.createIndex("by-internal-date", "internalDate");

    database.createObjectStore("syncMeta", {
      keyPath: "key",
    });
  },
});

export async function getAllThreads() {
  const database = await dbPromise;
  const threads = await database.getAll("threads");

  return threads.sort((left, right) => right.internalDate - left.internalDate);
}

export async function replaceThreads(threads: MailboxThread[]) {
  const database = await dbPromise;
  const transaction = database.transaction("threads", "readwrite");

  await transaction.store.clear();

  for (const thread of threads) {
    await transaction.store.put(thread);
  }

  await transaction.done;
}

export async function getThreadMessages(threadId: string) {
  const database = await dbPromise;
  const messages = await database.getAllFromIndex("messages", "by-threadId", threadId);

  return messages.sort((left, right) => left.internalDate - right.internalDate);
}

export async function replaceThreadMessages(threadId: string, messages: MailboxMessage[]) {
  const database = await dbPromise;
  const transaction = database.transaction("messages", "readwrite");
  const index = transaction.store.index("by-threadId");

  let cursor = await index.openCursor(threadId);

  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  for (const message of messages) {
    await transaction.store.put({
      ...message,
      threadId,
    });
  }

  await transaction.done;
}

export async function getSyncMetadata(key: string) {
  const database = await dbPromise;
  return database.get("syncMeta", key);
}

export async function setSyncMetadata(key: string, value: string) {
  const database = await dbPromise;

  await database.put("syncMeta", {
    key,
    updatedAt: Date.now(),
    value,
  });
}
