'use client';

import { UIButton } from '@zuko/ui';

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3">
      <p className="text-cloud-text">Что-то пошло не так</p>
      <UIButton variant="outline" size="sm" onClick={reset}>
        Повторить
      </UIButton>
    </div>
  );
}
