import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, type TagSummary } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

/**
 * Fetch all tags for the current user.
 */
export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.list(),
    queryFn: async () => {
      const res = await apiService.listTags();
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to load tags');
      }
      return res.data;
    },
  });
}

/**
 * Create a new tag with optimistic insert.
 */
export function useCreateTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { vehicleId: string; type?: 'qr' | 'etag' }) => {
      const res = await apiService.createTag(input);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to create tag');
      }
      return res.data;
    },
    onSuccess: (newTag) => {
      qc.setQueryData<TagSummary[]>(queryKeys.tags.list(), (old) =>
        old ? [newTag, ...old] : [newTag],
      );
      qc.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

/**
 * Activate a tag with optimistic state update.
 */
export function useActivateTag() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (tagId: string) => {
      const res = await apiService.activateTag(tagId);
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to activate tag');
      }
      return res.data;
    },
    onMutate: async (tagId) => {
      await qc.cancelQueries({ queryKey: queryKeys.tags.list() });
      const previous = qc.getQueryData<TagSummary[]>(queryKeys.tags.list());

      // Optimistic: mark as activated
      qc.setQueryData<TagSummary[]>(queryKeys.tags.list(), (old) =>
        old?.map((t) =>
          t.id === tagId ? { ...t, state: 'activated' as const } : t,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.tags.list(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}
