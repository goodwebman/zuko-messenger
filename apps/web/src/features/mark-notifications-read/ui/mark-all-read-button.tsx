'use client';

import { UIButton } from '@zuko/ui';
import { useMarkAllRead } from '../model/use-mark-all-read';

export function MarkAllReadButton() {
  const markAll = useMarkAllRead();
  return (
    <UIButton
      variant="ghost"
      size="sm"
      className="ml-auto"
      loading={markAll.isPending}
      onClick={() => markAll.mutate()}
    >
      Прочитать всё
    </UIButton>
  );
}
