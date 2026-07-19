'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Chat } from '@/widgets/chat';
import { ChatSkeleton, ErrorBoundary } from '@/shared/ui';

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();

  return (
    <ErrorBoundary>
      <Suspense fallback={<ChatSkeleton />}>
        <Chat conversationId={conversationId} />
      </Suspense>
    </ErrorBoundary>
  );
}
