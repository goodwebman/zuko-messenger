import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { Conversation } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';
import { totalUnread } from '../lib/conversation-cache';

export const fetchConversations = (): Promise<Conversation[]> =>
  apiFetch<Conversation[]>('/conversations');

export function useConversationsSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.conversations,
    queryFn: fetchConversations,
  });
}

/**
 * Производный счётчик непрочитанных для бейджа в шелле. Читает тот же кэш conversations,
 * что и список диалогов, — единый источник правды, без дублирования в Redux.
 */
export function useTotalUnread(enabled: boolean): number {
  const { data } = useQuery({
    queryKey: queryKeys.conversations,
    queryFn: fetchConversations,
    enabled,
  });
  return totalUnread(data);
}
