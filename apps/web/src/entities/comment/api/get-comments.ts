import { useSuspenseQuery } from '@tanstack/react-query';
import type { Comment } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';

export const fetchComments = (postId: string): Promise<Comment[]> =>
  apiFetch<Comment[]>(`/posts/${postId}/comments`);

export function useCommentsSuspense(postId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: () => fetchComments(postId),
  });
}
