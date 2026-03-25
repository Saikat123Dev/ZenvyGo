import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, type AlertItem } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

/**
 * Fetch all alerts for the current user.
 * Short staleTime (30s) to keep alerts relatively fresh.
 */
export function useAlerts() {
  return useQuery({
    queryKey: queryKeys.alerts.list(),
    queryFn: async () => {
      const res = await apiService.listAlerts();
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to load alerts');
      }
      return res.data;
    },
    staleTime: 30_000, // Alerts should be fresher than default
  });
}

/**
 * Mark a single alert as read with optimistic toggle.
 */
export function useMarkAlertRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const res = await apiService.markAlertRead(alertId);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to mark alert as read');
      }
      return res.data;
    },
    onMutate: async (alertId) => {
      await qc.cancelQueries({ queryKey: queryKeys.alerts.list() });
      const previous = qc.getQueryData<AlertItem[]>(queryKeys.alerts.list());

      // Optimistic: mark as read
      qc.setQueryData<AlertItem[]>(queryKeys.alerts.list(), (old) =>
        old?.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.alerts.list(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
  });
}

/**
 * Mark all alerts as read with optimistic bulk update.
 */
export function useMarkAllAlertsRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiService.markAllAlertsRead();
      if (!res.success) {
        throw new Error(res.error || 'Failed to mark all alerts as read');
      }
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.alerts.list() });
      const previous = qc.getQueryData<AlertItem[]>(queryKeys.alerts.list());

      // Optimistic: mark all as read
      qc.setQueryData<AlertItem[]>(queryKeys.alerts.list(), (old) =>
        old?.map((a) => ({ ...a, isRead: true })),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.alerts.list(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.alerts.all });
    },
  });
}
