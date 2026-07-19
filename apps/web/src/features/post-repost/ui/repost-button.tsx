'use client';

import { useToast } from '@zuko/ui';
import type { Post } from '@zuko/contracts';
import { useRepost } from '../model/use-repost';

export function RepostButton({ post }: { post: Post }) {
  const repost = useRepost();
  const { addToast } = useToast();
  // Репостим оригинал, а не сам репост.
  const targetId = post.repostOf?.id ?? post.id;

  return (
    <button
      type="button"
      aria-label="Репост"
      onClick={() =>
        repost.mutate(
          { id: targetId, body: '' },
          { onSuccess: () => addToast('Репост сделан', 'success') },
        )
      }
      className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-accent"
    >
      <span aria-hidden>↻</span>
      {post.repostCount > 0 && post.repostCount}
    </button>
  );
}
