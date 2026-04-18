import type { GmailProfile } from "../../types/gmail";

interface GmailThreadListItem {
  id: string;
  historyId?: string;
  snippet?: string;
}

interface GmailThreadListResponse {
  nextPageToken?: string;
  resultSizeEstimate?: number;
  threads?: GmailThreadListItem[];
}

interface GmailMessageHeader {
  name: string;
  value: string;
}

interface GmailMessagePartBody {
  attachmentId?: string;
  data?: string;
  size?: number;
}

export interface GmailMessagePart {
  body?: GmailMessagePartBody;
  filename?: string;
  headers?: GmailMessageHeader[];
  mimeType?: string;
  partId?: string;
  parts?: GmailMessagePart[];
}

export interface GmailMessage {
  id: string;
  internalDate?: string;
  payload?: GmailMessagePart;
  snippet?: string;
  threadId: string;
}

export interface GmailThread {
  historyId?: string;
  id: string;
  messages?: GmailMessage[];
  snippet?: string;
}

interface GetThreadOptions {
  format?: "full" | "metadata";
}

interface GmailApiErrorPayload {
  error?: {
    code?: number;
    message?: string;
  };
}

export class GmailApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GmailApiError";
    this.status = status;
  }
}

async function gmailFetch<T>(accessToken: string, path: string): Promise<T> {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as GmailApiErrorPayload | null;
    throw new GmailApiError(
      errorBody?.error?.message ?? "Gmail request failed.",
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export async function getProfile(accessToken: string) {
  return gmailFetch<GmailProfile>(accessToken, "profile");
}

export async function listThreads(
  accessToken: string,
  options?: {
    labelIds?: string[];
    maxResults?: number;
  },
) {
  const params = new URLSearchParams();
  params.set("maxResults", String(options?.maxResults ?? 30));

  for (const labelId of options?.labelIds ?? ["INBOX"]) {
    params.append("labelIds", labelId);
  }

  const response = await gmailFetch<GmailThreadListResponse>(
    accessToken,
    `threads?${params.toString()}`,
  );

  return response.threads ?? [];
}

export async function getThread(
  accessToken: string,
  threadId: string,
  options?: GetThreadOptions,
) {
  const params = new URLSearchParams();
  const format = options?.format ?? "full";

  params.set("format", format);

  if (format === "metadata") {
    params.append("metadataHeaders", "Subject");
    params.append("metadataHeaders", "From");
    params.append("metadataHeaders", "Date");
    params.append("metadataHeaders", "To");
  }

  return gmailFetch<GmailThread>(accessToken, `threads/${threadId}?${params.toString()}`);
}
