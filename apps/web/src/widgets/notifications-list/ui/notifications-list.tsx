'use client';

import { NotificationItem, useNotificationsSuspense } from '@/entities/notification';
import { EmptyState } from '@zuko/ui/app';

export function NotificationsList() {
  const { data } = useNotificationsSuspense();

  if (data.items.length === 0) {
    return (
      <div className="p-4">
        <EmptyState title="Пока нет уведомлений" />
      </div>
    );
  }

  return (
    <div>
      {data.items.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
