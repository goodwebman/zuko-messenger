'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UIButton } from '@zuko/ui';
import type { UserPublic } from '@zuko/contracts';
import { UserAvatar } from '@/entities/user';
import { selectCurrentUser } from '@/entities/session';
import { StartChatButton } from '@/features/start-conversation';
import { useAppSelector } from '@/shared/lib';

/** См. комментарий в entities/post/ui/post-images.tsx — грузим по клику. */
const ImageLightbox = dynamic(
  () => import('@zuko/ui/app/image-lightbox').then((m) => m.ImageLightbox),
  { ssr: false },
);

export function ProfileHeader({ user }: { user: UserPublic }) {
  const router = useRouter();
  const me = useAppSelector(selectCurrentUser);
  const isMe = me?.id === user.id;
  // null — просмотрщик ещё ни разу не открывали и в дерево его не монтируем.
  const [avatarIndex, setAvatarIndex] = useState<number | null>(null);
  const [lightboxMounted, setLightboxMounted] = useState(false);

  const openAvatar = () => {
    setLightboxMounted(true);
    setAvatarIndex(0);
  };

  return (
    <div className="border-b border-steel-border p-4">
      <div className="flex items-start justify-between gap-4">
        {user.avatarUrl ? (
          <button
            type="button"
            onClick={openAvatar}
            aria-label="Открыть фото профиля"
            className="press cursor-zoom-in rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-lime focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <UserAvatar user={user} className="size-20" />
          </button>
        ) : (
          <UserAvatar user={user} className="size-20" />
        )}
        {isMe ? (
          <UIButton variant="outline" onClick={() => router.push('/settings')}>
            Редактировать
          </UIButton>
        ) : (
          <StartChatButton userId={user.id} />
        )}
      </div>
      <div className="mt-3">
        <h2 className="font-satoshi text-2xl font-medium text-bone-text">{user.displayName}</h2>
        <p className="text-base text-fog-text">@{user.username}</p>
        {user.bio && <p className="mt-2 text-base text-cloud-text">{user.bio}</p>}
      </div>

      {lightboxMounted && user.avatarUrl && (
        <ImageLightbox
          images={[user.avatarUrl]}
          index={avatarIndex}
          onClose={() => setAvatarIndex(null)}
        />
      )}
    </div>
  );
}
