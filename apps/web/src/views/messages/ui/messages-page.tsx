'use client';

import { Suspense } from 'react';
import { ConversationList } from '@/widgets/conversation-list';
import { ConversationsSkeleton, ErrorBoundary, PageHeader } from '@/shared/ui';

export function MessagesPage() {
  return (
    <div className="min-h-dvh border-x border-steel-border">
      <PageHeader title="Сообщения" />
      <ErrorBoundary>
        <Suspense fallback={<ConversationsSkeleton />}>
          <ConversationList />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
