'use client';

import { UIButton, useToast } from '@zuko/ui';

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
    <UIButton variant="ghost" size="sm" onClick={copy} className="ml-auto">
      Ссылка
    </UIButton>
  );
}
