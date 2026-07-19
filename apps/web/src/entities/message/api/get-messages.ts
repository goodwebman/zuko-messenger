import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import type { Message, Paginated } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';

export function fetchMessages(
  conversationId: string,
  cursor?: string,
): Promise<Paginated<Message>> {
  const qs = cursor ? `?cursor=${cursor}` : '';
  return apiFetch<Paginated<Message>>(`/conversations/${conversationId}/messages${qs}`);
}

export function useMessages(conversationId: string) {
  return useSuspenseInfiniteQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: ({ pageParam }) => fetchMessages(conversationId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}
