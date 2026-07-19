import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreatePostInput, Post } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) =>
      apiFetch<Post>('/posts', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}
