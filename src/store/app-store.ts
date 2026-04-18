import { create } from "zustand";
import type { GmailProfile, MailboxThread } from "../types/gmail";

export type Theme = "light" | "dark" | "solar";

interface VoltaState {
  accessToken: string | null;
  authError: string | null;
  isAuthLoading: boolean;
  profile: GmailProfile | null;
  selectedThreadId: string | null;
  theme: Theme;
  threads: MailboxThread[];
  setAccessToken: (token: string | null) => void;
  setAuthError: (message: string | null) => void;
  setAuthLoading: (isLoading: boolean) => void;
  setProfile: (profile: GmailProfile | null) => void;
  setTheme: (theme: Theme) => void;
  setThreads: (threads: MailboxThread[]) => void;
  selectThread: (threadId: string | null) => void;
  logout: () => void;
}

function readStoredTheme(): Theme {
  const stored = localStorage.getItem("volta-theme");
  if (stored === "light" || stored === "dark" || stored === "solar") return stored;
  return "light";
}

export const useVoltaStore = create<VoltaState>((set) => ({
  accessToken: null,
  authError: null,
  isAuthLoading: false,
  profile: null,
  selectedThreadId: null,
  theme: readStoredTheme(),
  threads: [],
  setAccessToken: (accessToken) => set({ accessToken, authError: null }),
  setAuthError: (authError) => set({ authError }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
  setProfile: (profile) => set({ profile }),
  setTheme: (theme) => {
    localStorage.setItem("volta-theme", theme);
    set({ theme });
  },
  setThreads: (threads) =>
    set((state) => ({
      threads,
      selectedThreadId:
        state.selectedThreadId && threads.some((thread) => thread.id === state.selectedThreadId)
          ? state.selectedThreadId
          : threads[0]?.id ?? null,
    })),
  selectThread: (selectedThreadId) => set({ selectedThreadId }),
  logout: () =>
    set({
      accessToken: null,
      authError: null,
      isAuthLoading: false,
      profile: null,
    }),
}));
