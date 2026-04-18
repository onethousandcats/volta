import { useQuery, useQueryClient } from "@tanstack/react-query";
import { startTransition } from "react";
import { replaceThreads, setSyncMetadata } from "../../../lib/db";
import { getThread, listThreads } from "../../../lib/gmail/client";
import { extractThreadSummary } from "../../../lib/gmail/transformers";
import { useVoltaStore } from "../../../store/app-store";

const THREAD_LIMIT = 30;

export function useInboxThreads() {
  const accessToken = useVoltaStore((state) => state.accessToken);
  const setThreads = useVoltaStore((state) => state.setThreads);
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["gmail", "threads", accessToken],
    queryFn: async () => {
      if (!accessToken) {
        return [];
      }

      const threadShells = await listThreads(accessToken, {
        labelIds: ["INBOX"],
        maxResults: THREAD_LIMIT,
      });

      const summaries = (
        await Promise.all(
          threadShells.map(async (threadShell) => {
            const thread = await getThread(accessToken, threadShell.id, {
              format: "metadata",
            });

            return extractThreadSummary(thread);
          }),
        )
      ).sort((left, right) => right.internalDate - left.internalDate);

      await replaceThreads(summaries);
      await setSyncMetadata("lastThreadSync", String(Date.now()));

      startTransition(() => {
        setThreads(summaries);
      });

      queryClient.setQueryData(["mailbox", "threads-cache"], summaries);

      return summaries;
    },
    enabled: Boolean(accessToken),
    staleTime: 0,
  });
}
