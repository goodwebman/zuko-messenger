'use client';

import { useRouter } from 'next/navigation';
import { UIButton } from '@zuko/ui';
import type { UserPublic } from '@zuko/contracts';
import { UserAvatar } from '@/entities/user';
import { selectCurrentUser } from '@/entities/session';
import { StartChatButton } from '@/features/start-conversation';
import { useAppSelector } from '@/shared/lib';

export function ProfileHeader({ user }: { user: UserPublic }) {
  const router = useRouter();
  const me = useAppSelector(selectCurrentUser);
  const isMe = me?.id === user.id;

  return (
    <div className="border-b border-steel-border p-4">
      <div className="flex items-start justify-between gap-4">
        <UserAvatar user={user} className="size-16" />
        {isMe ? (
          <UIButton variant="outline" size="sm" onClick={() => router.push('/settings')}>
            Редактировать
          </UIButton>
        ) : (
          <StartChatButton userId={user.id} />
        )}
      </div>
      <div className="mt-3">
        <h2 className="font-satoshi text-xl font-medium text-bone-text">{user.displayName}</h2>
        <p className="text-sm text-fog-text">@{user.username}</p>
        {user.bio && <p className="mt-2 text-sm text-cloud-text">{user.bio}</p>}
      </div>
    </div>
  );
}
