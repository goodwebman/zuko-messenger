'use client';

import { useState } from 'react';
import { ConfirmDialog, TrashIcon } from '@zuko/ui/app';
import { useDeletePost } from '../model/use-delete-post';

export function DeletePostButton({ postId }: { postId: string }) {
  const deletePost = useDeletePost();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Удалить пост"
        title="Удалить пост"
        className="press rounded-lg p-1.5 text-fog-text transition-colors hover:bg-accent hover:text-destructive"
      >
        <TrashIcon className="size-5" />
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Удалить пост?"
        description="Пост и все комментарии к нему исчезнут безвозвратно."
        confirmLabel="Удалить"
        confirmVariant="destructive"
        loading={deletePost.isPending}
        onConfirm={() => deletePost.mutate(postId, { onSuccess: () => setOpen(false) })}
      />
    </>
  );
}
