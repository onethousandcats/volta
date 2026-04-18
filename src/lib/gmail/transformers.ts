import type { GmailMessage, GmailMessagePart, GmailThread } from "./client";
import type { MailboxMessage, MailboxThread, ThreadDetail } from "../../types/gmail";

function getHeaderValue(message: GmailMessage, headerName: string) {
  return (
    message.payload?.headers?.find(
      (header) => header.name.toLowerCase() === headerName.toLowerCase(),
    )?.value ?? ""
  );
}

function decodeBase64Url(value?: string) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  try {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(padded), (character: string) =>
          `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
        )
        .join(""),
    );
  } catch {
    return atob(padded);
  }
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBody(body: string) {
  return body.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function walkParts(parts: GmailMessagePart[] | undefined, visitor: (part: GmailMessagePart) => void) {
  if (!parts) {
    return;
  }

  for (const part of parts) {
    visitor(part);
    walkParts(part.parts, visitor);
  }
}

function extractBodyFromPayload(payload?: GmailMessagePart) {
  if (!payload) {
    return {
      attachmentCount: 0,
      body: "",
      hasAttachments: false,
    };
  }

  let textBody = "";
  let htmlBody = "";
  let attachmentCount = 0;

  const collectPart = (part: GmailMessagePart) => {
    const mimeType = part.mimeType ?? "";
    const body = decodeBase64Url(part.body?.data);

    if (part.filename || part.body?.attachmentId) {
      attachmentCount += 1;
    }

    if (mimeType === "text/plain" && body && !textBody) {
      textBody = body;
    }

    if (mimeType === "text/html" && body && !htmlBody) {
      htmlBody = stripHtml(body);
    }
  };

  collectPart(payload);
  walkParts(payload.parts, collectPart);

  const body = normalizeBody(textBody || htmlBody);

  return {
    attachmentCount,
    body,
    hasAttachments: attachmentCount > 0,
  };
}

function parseSender(fromValue: string) {
  const emailMatch = fromValue.match(/<([^>]+)>/);
  const senderEmail = emailMatch?.[1];
  const senderName = fromValue.replace(/<[^>]+>/, "").replace(/"/g, "").trim();

  return {
    sender: senderName || senderEmail || fromValue || "Unknown sender",
    senderEmail,
  };
}

function mapMessage(message: GmailMessage): MailboxMessage {
  const from = getHeaderValue(message, "From");
  const to = getHeaderValue(message, "To");
  const subject = getHeaderValue(message, "Subject") || "No subject";
  const date = getHeaderValue(message, "Date");
  const internalDate = Number(message.internalDate ?? Date.now());
  const decoded = extractBodyFromPayload(message.payload);
  const payloadHeaders =
    message.payload?.headers?.reduce<Record<string, string>>((accumulator, header) => {
      accumulator[header.name] = header.value;
      return accumulator;
    }, {}) ?? {};

  return {
    id: message.id,
    threadId: message.threadId,
    snippet: message.snippet ?? "",
    internalDate,
    from,
    to,
    subject,
    date,
    body: decoded.body || message.snippet || "",
    payloadHeaders,
    hasAttachments: decoded.hasAttachments,
    attachmentCount: decoded.attachmentCount,
  };
}

export function extractThreadSummary(thread: GmailThread): MailboxThread {
  const messages = [...(thread.messages ?? [])].sort(
    (left, right) => Number(right.internalDate ?? 0) - Number(left.internalDate ?? 0),
  );
  const latestMessage = messages[0];
  const subject = latestMessage ? getHeaderValue(latestMessage, "Subject") || "No subject" : "No subject";
  const fromValue = latestMessage ? getHeaderValue(latestMessage, "From") : "";
  const dateValue = latestMessage ? getHeaderValue(latestMessage, "Date") : "";
  const internalDate = Number(latestMessage?.internalDate ?? Date.now());
  const { sender, senderEmail } = parseSender(fromValue);

  return {
    id: thread.id,
    snippet: thread.snippet ?? latestMessage?.snippet ?? "",
    historyId: thread.historyId,
    lastUpdated: Date.now(),
    subject,
    sender,
    senderEmail,
    date: dateValue,
    internalDate,
    messageIds: messages.map((message) => message.id),
  };
}

export function extractThreadDetail(thread: GmailThread): ThreadDetail {
  const messages = [...(thread.messages ?? [])]
    .sort((left, right) => Number(left.internalDate ?? 0) - Number(right.internalDate ?? 0))
    .map(mapMessage);

  return {
    id: thread.id,
    snippet: thread.snippet ?? "",
    historyId: thread.historyId,
    messages,
  };
}
