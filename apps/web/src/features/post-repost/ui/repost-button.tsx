'use client';

import { useToast } from '@zuko/ui';
import type { Post } from '@zuko/contracts';
import { useAuthGate } from '@/entities/session';
import { RepostIcon, actionItemIcon, actionItemVariants } from '@zuko/ui/app';
import { useRepost } from '../model/use-repost';

export function RepostButton({ post }: { post: Post }) {
  const repost = useRepost();
  const { addToast } = useToast();
  const { ensureAuthed } = useAuthGate();
  // Репостим оригинал, а не сам репост.
  const targetId = post.repostOf?.id ?? post.id;

  const doRepost = () => {
    if (!ensureAuthed()) return;
    repost.mutate(
      { id: targetId, body: '' },
      { onSuccess: () => addToast('Репост сделан', 'success') },
    );
  };

  return (
    <button
      type="button"
      aria-label="Репост"
      title="Репостнуть"
      onClick={doRepost}
      className={actionItemVariants()}
    >
      <RepostIcon className={actionItemIcon} />
      {post.repostCount > 0 && post.repostCount}
    </button>
  );
}
