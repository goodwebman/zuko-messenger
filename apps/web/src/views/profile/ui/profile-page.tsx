'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useUserSuspense } from '@/entities/user';
import { ProfileHeader } from '@/widgets/profile-header';
import { Feed } from '@/widgets/feed';
import { ErrorBoundary, FeedSkeleton, PageHeader, ProfileSkeleton } from '@/shared/ui';

function ProfileContent({ username }: { username: string }) {
  const { data: user } = useUserSuspense(username);
  return (
    <>
      <ProfileHeader user={user} />
      <Suspense fallback={<FeedSkeleton />}>
        <Feed authorId={user.id} />
      </Suspense>
    </>
  );
}

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();

  return (
    <div className="min-h-dvh border-x border-steel-border">
      <PageHeader title="Профиль" />
      <ErrorBoundary fallback={<div className="p-4 text-fog-text">Пользователь не найден</div>}>
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent username={username} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
