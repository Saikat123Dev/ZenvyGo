import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient configuration
 *
 * staleTime: Data is considered fresh for 60s (prevents unnecessary refetches)
 * gcTime: Unused cache entries are garbage-collected after 5 minutes
 * retry: Failed requests retry twice with exponential backoff
 * refetchOnWindowFocus: Disabled for React Native (no "window focus" concept)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
