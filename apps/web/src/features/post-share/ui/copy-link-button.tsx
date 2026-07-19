'use client';

import { useToast } from '@zuko/ui';
import { cn } from '@zuko/ui';
import { LinkIcon, actionItemIcon, actionItemVariants } from '@zuko/ui/app';

export function CopyLinkButton({ postId }: { postId: string }) {
  const { addToast } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
      addToast('Ссылка скопирована', 'success');
    } catch {
      addToast('Не удалось скопировать', 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Скопировать ссылку"
      title="Скопировать ссылку"
      className={cn(actionItemVariants(), 'ml-auto')}
    >
      <LinkIcon className={actionItemIcon} />
    </button>
  );
}
