import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getThreadMessages, replaceThreadMessages } from "../../../lib/db";
import { getThread } from "../../../lib/gmail/client";
import { extractThreadDetail } from "../../../lib/gmail/transformers";
import { useVoltaStore } from "../../../store/app-store";

export function useSelectedThread(threadId: string | null) {
  const accessToken = useVoltaStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  const cachedQuery = useQuery({
    queryKey: ["gmail", "thread-cache", threadId],
    queryFn: async () => {
      if (!threadId) {
        return [];
      }

      return getThreadMessages(threadId);
    },
    enabled: Boolean(threadId),
    staleTime: Infinity,
  });

  const remoteQuery = useQuery({
    queryKey: ["gmail", "thread", threadId, accessToken],
    queryFn: async () => {
      if (!threadId || !accessToken) {
        return null;
      }

      const thread = await getThread(accessToken, threadId, {
        format: "full",
      });
      const detail = extractThreadDetail(thread);

      await replaceThreadMessages(threadId, detail.messages);
      await queryClient.invalidateQueries({
        queryKey: ["gmail", "thread-cache", threadId],
      });

      return detail;
    },
    enabled: Boolean(threadId && accessToken),
    staleTime: 0,
  });

  return {
    error: remoteQuery.error ?? cachedQuery.error,
    isLoading: cachedQuery.isLoading || remoteQuery.isLoading,
    isRefreshing: remoteQuery.isFetching,
    messages: remoteQuery.data?.messages ?? cachedQuery.data ?? [],
  };
}
