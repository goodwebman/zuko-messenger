'use client';

import { useState } from 'react';
import { cn } from '@zuko/ui';
import type { Post } from '@zuko/contracts';
import { useAuthGate } from '@/entities/session';
import { HeartIcon, ParticleBurst, actionItemIcon, actionItemVariants } from '@zuko/ui/app';
import { useToggleLike } from '../model/use-toggle-like';

export function LikeButton({ post }: { post: Post }) {
  const toggleLike = useToggleLike();
  const { ensureAuthed } = useAuthGate();
  /**
   * 0 — всплеска нет. Ненулевое значение служит `key`: смена ключа заново
   * монтирует ParticleBurst, и анимация перезапускается без эффекта и без
   * отдельного флага «уже играл».
   */
  const [burstId, setBurstId] = useState(0);

  const toggle = () => {
    if (!ensureAuthed()) return;
    // Конфети только на постановку лайка — на снятии праздновать нечего.
    if (!post.likedByMe) setBurstId((id) => id + 1);
    toggleLike.mutate({ id: post.id, liked: post.likedByMe });
  };

  return (
    <button
      type="button"
      aria-pressed={post.likedByMe}
      aria-label={post.likedByMe ? 'Убрать лайк' : 'Лайкнуть'}
      title={post.likedByMe ? 'Убрать лайк' : 'Лайкнуть'}
      onClick={toggle}
      className={actionItemVariants({ active: post.likedByMe })}
    >
      <span className="relative flex items-center">
        <HeartIcon
          filled={post.likedByMe}
          className={cn(actionItemIcon, post.likedByMe && 'animate-pop')}
        />
        {burstId > 0 && <ParticleBurst key={burstId} onDone={() => setBurstId(0)} />}
      </span>
      {post.likeCount > 0 && post.likeCount}
    </button>
  );
}
