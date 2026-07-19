'use client';

import { Suspense } from 'react';
import { selectCurrentUser } from '@/entities/session';
import { PostComposer } from '@/features/post-create';
import { Feed } from '@/widgets/feed';
import { ErrorBoundary, FeedSkeleton, PageHeader } from '@zuko/ui/app';
import { AuthCta } from '@/features/auth';
import { useAppSelector } from '@/shared/lib';

export function FeedPage() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className="min-h-dvh border-x border-steel-border">
      <PageHeader title="Лента" />
      {user ? (
        <PostComposer user={user} />
      ) : (
        <AuthCta
          title="Читаете как гость"
          description="Войдите, чтобы публиковать посты, лайкать и отвечать."
          action="Войти"
        />
      )}
      <ErrorBoundary>
        <Suspense fallback={<FeedSkeleton />}>
          <Feed />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
