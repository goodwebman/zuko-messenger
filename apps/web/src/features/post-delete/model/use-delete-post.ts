import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api';

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}
