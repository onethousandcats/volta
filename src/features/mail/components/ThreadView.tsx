import { EmptyState } from "../../../components/EmptyState";
import { LoadingState } from "../../../components/LoadingState";
import { formatMessageDate } from "../../../lib/format";
import type { MailboxMessage, MailboxThread } from "../../../types/gmail";

interface ThreadViewProps {
  error?: Error | null;
  isLoading: boolean;
  isRefreshing: boolean;
  messages: MailboxMessage[];
  selectedThread: MailboxThread | null;
}

export function ThreadView({
  error,
  isLoading,
  isRefreshing,
  messages,
  selectedThread,
}: ThreadViewProps) {
  if (!selectedThread) {
    return (
      <section className="flex flex-1 items-center justify-center bg-app">
        <EmptyState eyebrow="Reader" title="Select a thread">
          Choose a thread from the inbox to read it here.
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col overflow-hidden bg-app">
      <header className="border-b border-gray-200 bg-panel px-8 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-ink">{selectedThread.subject}</h2>
            <p className="mt-1 text-sm text-muted">{selectedThread.snippet}</p>
          </div>
          <div className="shrink-0 text-right text-xs text-muted">
            <p>{messages.length} {messages.length === 1 ? "message" : "messages"}</p>
            {isRefreshing ? <p className="mt-0.5">Refreshing…</p> : null}
          </div>
        </div>
      </header>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-8 py-6">
        {isLoading && messages.length === 0 ? <LoadingState label="Loading thread…" /> : null}

        {error && messages.length === 0 ? (
          <EmptyState eyebrow="Error" title="Thread could not be loaded">
            {error.message}
          </EmptyState>
        ) : null}

        {!isLoading && !error && messages.length === 0 ? (
          <EmptyState eyebrow="Thread" title="No messages cached">
            Connect Gmail or refresh to fetch message content.
          </EmptyState>
        ) : null}

        {messages.map((message) => (
          <article
            key={message.id}
            className="rounded-md border border-gray-200 bg-panel px-6 py-5 text-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <p className="font-medium text-ink">{message.from || "Unknown sender"}</p>
                {message.to ? <p className="mt-0.5 text-xs text-muted">to {message.to}</p> : null}
              </div>
              <time className="shrink-0 text-xs text-muted" dateTime={new Date(message.internalDate).toISOString()}>
                {formatMessageDate(message.internalDate)}
              </time>
            </div>

            <div className="mt-4 whitespace-pre-wrap break-words leading-7 text-ink">
              {message.body || message.snippet || "No plain text body available."}
            </div>

            {message.hasAttachments ? (
              <div className="mt-4 rounded border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs text-muted">
                {message.attachmentCount} attachment{message.attachmentCount !== 1 ? "s" : ""}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
