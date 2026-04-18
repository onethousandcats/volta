import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoginButton } from "../features/auth/components/LoginButton";
import { useMailboxBootstrap } from "../features/mail/hooks/useMailboxBootstrap";
import { useInboxThreads } from "../features/mail/hooks/useInboxThreads";
import { useSelectedThread } from "../features/mail/hooks/useSelectedThread";
import { ThreadList } from "../features/mail/components/ThreadList";
import { ThreadView } from "../features/mail/components/ThreadView";
import { ThemeSelector } from "../components/ThemeSelector";
import { getProfile } from "../lib/gmail/client";
import { useVoltaStore } from "../store/app-store";

const NAV_ITEMS = [
  { label: "Inbox", active: true },
  { label: "Sent" },
  { label: "Drafts" },
  { label: "Archive" },
  { label: "Trash" },
];

export function App() {
  const accessToken = useVoltaStore((state) => state.accessToken);
  const profile = useVoltaStore((state) => state.profile);
  const selectedThreadId = useVoltaStore((state) => state.selectedThreadId);
  const selectThread = useVoltaStore((state) => state.selectThread);
  const setProfile = useVoltaStore((state) => state.setProfile);
  const theme = useVoltaStore((state) => state.theme);
  const threads = useVoltaStore((state) => state.threads);
  const { isCacheReady } = useMailboxBootstrap();
  const inboxQuery = useInboxThreads();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useQuery({
    queryKey: ["gmail", "profile", accessToken],
    queryFn: async () => {
      if (!accessToken) return null;
      const gmailProfile = await getProfile(accessToken);
      setProfile(gmailProfile);
      return gmailProfile;
    },
    enabled: Boolean(accessToken),
  });

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [selectedThreadId, threads],
  );
  const threadQuery = useSelectedThread(selectedThreadId);

  return (
    <div className="flex h-screen overflow-hidden bg-app text-ink">
      {/* Col 1: Sidebar */}
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-border bg-panel">
        <div className="px-5 py-5">
          <span className="text-lg font-medium tracking-wide text-ink">⚡ Volta</span>
        </div>

        <div className="px-4 pb-4">
          <button
            type="button"
            className="w-full rounded-md bg-ink px-4 py-2 text-sm font-medium text-panel transition hover:opacity-80"
          >
            Compose
          </button>
        </div>

        <nav className="flex-1 px-3">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`flex items-center rounded-md px-3 py-2 text-sm transition ${
                item.active
                  ? "bg-accent-bg font-medium text-accent-text"
                  : "text-muted hover:bg-panel-alt hover:text-ink"
              }`}
            >
              {item.label}
              {item.active && threads.length > 0 ? (
                <span className="ml-auto text-xs font-normal text-accent">{threads.length}</span>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="space-y-3 border-t border-border p-4">
          <ThemeSelector />
          {profile ? (
            <p className="truncate text-xs text-muted">{profile.emailAddress}</p>
          ) : null}
          <LoginButton />
          <button
            type="button"
            onClick={() => void inboxQuery.refetch()}
            disabled={!accessToken || inboxQuery.isFetching}
            className="w-full text-left text-xs text-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {inboxQuery.isFetching ? "Refreshing…" : "Refresh inbox"}
          </button>
          {inboxQuery.error instanceof Error ? (
            <p className="text-xs text-red-500">{inboxQuery.error.message}</p>
          ) : null}
        </div>
      </aside>

      {/* Col 2: Thread list */}
      <ThreadList
        activeThreadId={selectedThreadId}
        isCacheReady={isCacheReady}
        isSyncing={inboxQuery.isFetching}
        onSelectThread={selectThread}
        threads={threads}
      />

      {/* Col 3: Thread detail */}
      <ThreadView
        error={threadQuery.error instanceof Error ? threadQuery.error : null}
        isLoading={threadQuery.isLoading}
        isRefreshing={threadQuery.isRefreshing}
        messages={threadQuery.messages}
        selectedThread={selectedThread}
      />
    </div>
  );
}
