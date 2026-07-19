import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ ok: true }>('/notifications/read-all', { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}
