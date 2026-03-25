/**
 * App Store — Lightweight local state
 *
 * ⚠️ DATA FETCHING HAS MOVED TO TANSTACK QUERY HOOKS
 *
 * This store now ONLY holds non-API local state.
 * All server-state (vehicles, tags, alerts, sessions) is managed by
 * the hooks in /hooks/use-*.ts via TanStack Query.
 *
 * If you need to clear all cached queries (e.g. on logout), use:
 *   import { queryClient } from '@/lib/query-client';
 *   queryClient.clear();
 */
import { create } from 'zustand';

interface AppState {
  // UI-only flags that don't come from the server
  hasCompletedOnboarding: boolean;
  setOnboardingComplete: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  hasCompletedOnboarding: false,
  setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
}));
