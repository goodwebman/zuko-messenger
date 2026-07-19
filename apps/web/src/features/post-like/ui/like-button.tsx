'use client';

import { cn } from '@zuko/ui';
import type { Post } from '@zuko/contracts';
import { useToggleLike } from '../model/use-toggle-like';

export function LikeButton({ post }: { post: Post }) {
  const toggleLike = useToggleLike();
  return (
    <button
      type="button"
      aria-pressed={post.likedByMe}
      aria-label={post.likedByMe ? 'Убрать лайк' : 'Лайкнуть'}
      onClick={() => toggleLike.mutate({ id: post.id, liked: post.likedByMe })}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-accent',
        post.likedByMe && 'text-signal-lime',
      )}
    >
      <span aria-hidden>{post.likedByMe ? '♥' : '♡'}</span>
      {post.likeCount > 0 && post.likeCount}
    </button>
  );
}
