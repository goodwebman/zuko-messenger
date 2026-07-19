import { useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { Conversation } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';
import { useAppDispatch } from '@/shared/lib';
import { setUnreadMap } from '../model/slice';

export const fetchConversations = (): Promise<Conversation[]> =>
  apiFetch<Conversation[]>('/conversations');

export function useConversationsSuspense() {
  const dispatch = useAppDispatch();
  const query = useSuspenseQuery({
    queryKey: queryKeys.conversations,
    queryFn: fetchConversations,
  });

  useEffect(() => {
    const map: Record<string, number> = {};
    for (const c of query.data) map[c.id] = c.unreadCount;
    dispatch(setUnreadMap(map));
  }, [query.data, dispatch]);

  return query;
}
