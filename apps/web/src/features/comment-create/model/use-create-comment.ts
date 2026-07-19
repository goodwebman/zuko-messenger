import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Comment, CreateCommentInput } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';
import { patchPost } from '@/entities/post';

export function useCreateComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      apiFetch<Comment>(`/posts/${postId}/comments`, { method: 'POST', body: input }),
    onSuccess: (comment) => {
      qc.setQueryData<Comment[]>(queryKeys.comments(postId), (old) => [...(old ?? []), comment]);
      patchPost(qc, postId, (p) => ({ ...p, commentCount: p.commentCount + 1 }));
    },
  });
}
