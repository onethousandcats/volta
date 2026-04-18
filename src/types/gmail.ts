export interface GmailProfile {
  emailAddress: string;
  historyId: string;
  messagesTotal: number;
  threadsTotal: number;
}

export interface MailboxThread {
  id: string;
  snippet: string;
  historyId?: string;
  lastUpdated: number;
  subject: string;
  sender: string;
  senderEmail?: string;
  date: string;
  internalDate: number;
  messageIds: string[];
}

export interface MailboxMessage {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: number;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  payloadHeaders: Record<string, string>;
  hasAttachments: boolean;
  attachmentCount: number;
}

export interface ThreadDetail {
  id: string;
  snippet: string;
  historyId?: string;
  messages: MailboxMessage[];
}

export interface SyncMetadata {
  key: string;
  updatedAt: number;
  value: string;
}
