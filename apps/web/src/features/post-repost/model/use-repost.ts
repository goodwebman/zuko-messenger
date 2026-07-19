import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Post, RepostInput } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';

export function useRepost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string } & RepostInput) =>
      apiFetch<Post>(`/posts/${id}/repost`, { method: 'POST', body: { body } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}
