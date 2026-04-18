import { memo, useMemo, useRef } from "react";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { EmptyState } from "../../../components/EmptyState";
import { LoadingState } from "../../../components/LoadingState";
import { useElementSize } from "../../../components/useElementSize";
import { formatThreadDate } from "../../../lib/format";
import type { MailboxThread } from "../../../types/gmail";

const ROW_HEIGHT = 88;

interface ThreadListProps {
  activeThreadId: string | null;
  isCacheReady: boolean;
  isSyncing: boolean;
  onSelectThread: (threadId: string) => void;
  threads: MailboxThread[];
}

interface ThreadRowData {
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  threads: MailboxThread[];
}

const ThreadRow = memo(function ThreadRow({
  data,
  index,
  style,
}: ListChildComponentProps<ThreadRowData>) {
  const thread = data.threads[index];
  const isActive = data.activeThreadId === thread.id;

  return (
    <div style={style} className="px-2">
      <button
        type="button"
        onClick={() => data.onSelectThread(thread.id)}
        className={`flex h-[80px] w-full flex-col justify-center border-b px-3 text-left transition ${
          isActive
            ? "bg-blue-50"
            : "border-transparent hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-semibold text-ink">{thread.sender}</span>
          <span className="shrink-0 text-xs text-muted">{formatThreadDate(thread.internalDate)}</span>
        </div>
        <div className="mt-0.5 truncate text-sm text-ink">{thread.subject}</div>
        <div className="mt-1 truncate text-xs text-muted">{thread.snippet}</div>
      </button>
    </div>
  );
});

export function ThreadList({
  activeThreadId,
  isCacheReady,
  isSyncing,
  onSelectThread,
  threads,
}: ThreadListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { height, width } = useElementSize(containerRef);
  const itemData = useMemo<ThreadRowData>(
    () => ({ activeThreadId, onSelectThread, threads }),
    [activeThreadId, onSelectThread, threads],
  );

  return (
    <section className="flex w-[380px] shrink-0 flex-col border-r border-gray-200 bg-panel">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Inbox</h2>
          <p className="mt-0.5 text-xs text-muted">{threads.length} threads</p>
        </div>
        {isSyncing ? (
          <span className="text-xs text-muted">Syncing…</span>
        ) : !isCacheReady ? (
          <span className="text-xs text-muted">Loading…</span>
        ) : null}
      </div>

      <div ref={containerRef} className="min-h-0 flex-1">
        {!isCacheReady && threads.length === 0 ? (
          <div className="p-4">
            <LoadingState label="Loading local cache…" />
          </div>
        ) : threads.length === 0 ? (
          <div className="p-4">
            <EmptyState eyebrow="Inbox" title="No threads cached yet">
              Connect Gmail to pull your inbox into the local cache.
            </EmptyState>
          </div>
        ) : height < 40 ? (
          <div className="p-4">
            <LoadingState label="Sizing thread list…" />
          </div>
        ) : (
          <FixedSizeList
            className="scrollbar-thin"
            height={Math.max(height, ROW_HEIGHT)}
            width={Math.max(width, 280)}
            itemCount={threads.length}
            itemData={itemData}
            itemKey={(index, data) => data.threads[index].id}
            itemSize={ROW_HEIGHT}
          >
            {ThreadRow as (props: ListChildComponentProps<ThreadRowData>) => JSX.Element}
          </FixedSizeList>
        )}
      </div>
    </section>
  );
}
