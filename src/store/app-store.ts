import { create } from "zustand";
import type { GmailProfile, MailboxThread } from "../types/gmail";

interface VoltaState {
  accessToken: string | null;
  authError: string | null;
  isAuthLoading: boolean;
  profile: GmailProfile | null;
  selectedThreadId: string | null;
  threads: MailboxThread[];
  setAccessToken: (token: string | null) => void;
  setAuthError: (message: string | null) => void;
  setAuthLoading: (isLoading: boolean) => void;
  setProfile: (profile: GmailProfile | null) => void;
  setThreads: (threads: MailboxThread[]) => void;
  selectThread: (threadId: string | null) => void;
  logout: () => void;
}

export const useVoltaStore = create<VoltaState>((set) => ({
  accessToken: null,
  authError: null,
  isAuthLoading: false,
  profile: null,
  selectedThreadId: null,
  threads: [],
  setAccessToken: (accessToken) =>
    set({
      accessToken,
      authError: null,
    }),
  setAuthError: (authError) => set({ authError }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
  setProfile: (profile) => set({ profile }),
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
