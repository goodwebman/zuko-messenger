import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import type { Paginated, Post } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';

export function fetchFeed(cursor: string | undefined, authorId?: string): Promise<Paginated<Post>> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  if (authorId) params.set('authorId', authorId);
  const qs = params.toString();
  return apiFetch<Paginated<Post>>(`/posts${qs ? `?${qs}` : ''}`);
}

export function useFeed(authorId?: string) {
  return useSuspenseInfiniteQuery({
    queryKey: queryKeys.feed(authorId),
    queryFn: ({ pageParam }) => fetchFeed(pageParam, authorId),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}
