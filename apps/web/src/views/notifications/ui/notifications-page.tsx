'use client';

import { Suspense } from 'react';
import { NotificationsList } from '@/widgets/notifications-list';
import { MarkAllReadButton } from '@/features/mark-notifications-read';
import { ErrorBoundary, NotificationsSkeleton, PageHeader } from '@/shared/ui';

export function NotificationsPage() {
  return (
    <div className="min-h-dvh border-x border-steel-border">
      <PageHeader title="Уведомления">
        <MarkAllReadButton />
      </PageHeader>
      <ErrorBoundary>
        <Suspense fallback={<NotificationsSkeleton />}>
          <NotificationsList />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
