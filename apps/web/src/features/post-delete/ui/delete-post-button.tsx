'use client';

import { useState } from 'react';
import { useDeletePost } from '../model/use-delete-post';

export function DeletePostButton({ postId }: { postId: string }) {
  const deletePost = useDeletePost();
  const [confirming, setConfirming] = useState(false);

  return (
    <button
      type="button"
      onClick={() => (confirming ? deletePost.mutate(postId) : setConfirming(true))}
      onBlur={() => setConfirming(false)}
      className="text-xs text-fog-text transition-colors hover:text-destructive"
    >
      {confirming ? 'Точно?' : 'Удалить'}
    </button>
  );
}
