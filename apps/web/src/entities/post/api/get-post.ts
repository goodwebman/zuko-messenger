import { useSuspenseQuery } from '@tanstack/react-query';
import type { Post } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';

export const fetchPost = (id: string): Promise<Post> => apiFetch<Post>(`/posts/${id}`);

export function usePostSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.post(id),
    queryFn: () => fetchPost(id),
  });
}
