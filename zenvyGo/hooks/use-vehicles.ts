import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, type Vehicle } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

/**
 * Fetch all vehicles for the current user.
 * Caches for 60s (global staleTime), auto-refetches on reconnect.
 */
export function useVehicles() {
  return useQuery({
    queryKey: queryKeys.vehicles.list(),
    queryFn: async () => {
      const res = await apiService.listVehicles();
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to load vehicles');
      }
      return res.data;
    },
  });
}

/**
 * Create a new vehicle with optimistic insert.
 * On success, the list is refetched to guarantee consistency.
 */
export function useCreateVehicle() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      plateNumber: string;
      plateRegion?: string | null;
      make?: string | null;
      model?: string | null;
      color?: string | null;
      year?: number | null;
    }) => {
      const res = await apiService.createVehicle(input);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to create vehicle');
      }
      return res.data;
    },
    onSuccess: (newVehicle) => {
      // Optimistically insert into cache, then refetch for consistency
      qc.setQueryData<Vehicle[]>(queryKeys.vehicles.list(), (old) =>
        old ? [newVehicle, ...old] : [newVehicle],
      );
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      qc.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

/**
 * Update a vehicle with optimistic in-place update.
 */
export function useUpdateVehicle() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      ...input
    }: {
      vehicleId: string;
      plateNumber?: string;
      plateRegion?: string | null;
      make?: string | null;
      model?: string | null;
      color?: string | null;
      year?: number | null;
    }) => {
      const res = await apiService.updateVehicle(vehicleId, input);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update vehicle');
      }
      return res.data;
    },
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: queryKeys.vehicles.list() });
      const previous = qc.getQueryData<Vehicle[]>(queryKeys.vehicles.list());

      // Optimistic update
      qc.setQueryData<Vehicle[]>(queryKeys.vehicles.list(), (old) =>
        old?.map((v) =>
          v.id === variables.vehicleId ? { ...v, ...variables } : v,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previous) {
        qc.setQueryData(queryKeys.vehicles.list(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.all });
    },
  });
}

/**
 * Archive (soft-delete) a vehicle with optimistic removal.
 */
export function useArchiveVehicle() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleId: string) => {
      const res = await apiService.archiveVehicle(vehicleId);
      if (!res.success) {
        throw new Error(res.error || 'Failed to archive vehicle');
      }
    },
    onMutate: async (vehicleId) => {
      await qc.cancelQueries({ queryKey: queryKeys.vehicles.list() });
      const previous = qc.getQueryData<Vehicle[]>(queryKeys.vehicles.list());

      // Optimistic remove
      qc.setQueryData<Vehicle[]>(queryKeys.vehicles.list(), (old) =>
        old?.filter((v) => v.id !== vehicleId),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.vehicles.list(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.all });
      qc.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}
