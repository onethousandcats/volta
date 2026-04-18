import { startTransition, useEffect, useState } from "react";
import { getAllThreads, getSyncMetadata } from "../../../lib/db";
import { useVoltaStore } from "../../../store/app-store";

export function useMailboxBootstrap() {
  const setThreads = useVoltaStore((state) => state.setThreads);
  const [isCacheReady, setIsCacheReady] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function hydrateCache() {
      try {
        const [threads, syncMeta] = await Promise.all([
          getAllThreads(),
          getSyncMetadata("lastThreadSync"),
        ]);

        if (isCancelled) {
          return;
        }

        startTransition(() => {
          setThreads(threads);
        });

        setLastSyncAt(syncMeta ? Number(syncMeta.value) : null);
      } finally {
        if (!isCancelled) {
          setIsCacheReady(true);
        }
      }
    }

    void hydrateCache();

    return () => {
      isCancelled = true;
    };
  }, [setThreads]);

  return {
    isCacheReady,
    lastSyncAt,
  };
}
