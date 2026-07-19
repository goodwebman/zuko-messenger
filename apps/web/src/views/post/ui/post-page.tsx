'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { PostDetail } from '@/widgets/post-detail';
import { ErrorBoundary, FeedSkeleton, PageHeader } from '@/shared/ui';

export function PostPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-dvh border-x border-steel-border">
      <PageHeader title="Пост" />
      <ErrorBoundary fallback={<div className="p-4 text-fog-text">Пост не найден</div>}>
        <Suspense fallback={<FeedSkeleton />}>
          <PostDetail postId={id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
