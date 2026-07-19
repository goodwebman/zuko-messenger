'use client';

import { Suspense } from 'react';
import { selectCurrentUser } from '@/entities/session';
import { PostComposer } from '@/features/post-create';
import { Feed } from '@/widgets/feed';
import { ErrorBoundary, FeedSkeleton, PageHeader } from '@/shared/ui';
import { useAppSelector } from '@/shared/lib';

export function FeedPage() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className="min-h-dvh border-x border-steel-border">
      <PageHeader title="Лента" />
      {user && <PostComposer user={user} />}
      <ErrorBoundary>
        <Suspense fallback={<FeedSkeleton />}>
          <Feed />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
