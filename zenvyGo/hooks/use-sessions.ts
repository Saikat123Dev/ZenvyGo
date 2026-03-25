import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, type ContactSession } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

/**
 * Fetch all contact sessions for the current user.
 * Short staleTime (30s) for near-real-time feel.
 */
export function useContactSessions() {
  return useQuery({
    queryKey: queryKeys.sessions.list(),
    queryFn: async () => {
      const res = await apiService.listContactSessions();
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to load contact sessions');
      }
      return res.data;
    },
    staleTime: 30_000,
  });
}

/**
 * Resolve a contact session with optimistic status update.
 */
export function useResolveSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiService.resolveContactSession(sessionId);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to resolve session');
      }
      return res.data;
    },
    onMutate: async (sessionId) => {
      await qc.cancelQueries({ queryKey: queryKeys.sessions.list() });
      const previous = qc.getQueryData<ContactSession[]>(queryKeys.sessions.list());

      // Optimistic: mark as resolved
      qc.setQueryData<ContactSession[]>(queryKeys.sessions.list(), (old) =>
        old?.map((s) =>
          s.id === sessionId
            ? { ...s, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
            : s,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.sessions.list(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sessions.all });
      qc.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
  });
}
