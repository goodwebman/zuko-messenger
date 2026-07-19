import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { Notification } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';

export interface NotificationsResponse {
  items: Notification[];
  unread: number;
}

export const fetchNotifications = (): Promise<NotificationsResponse> =>
  apiFetch<NotificationsResponse>('/notifications');

export function useNotificationsSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchNotifications,
  });
}

/** Не-suspense вариант для бейджа в сайдбаре (не должен «подвешивать» весь shell). */
export function useNotificationsBadge(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchNotifications,
    enabled,
  });
}
