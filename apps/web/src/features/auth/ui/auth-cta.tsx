'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buttonVariants, cn } from '@zuko/ui';

interface AuthCtaProps {
  title: string;
  description?: string;
  /** Подпись основной кнопки — под контекст («Войти и ответить»). */
  action?: string;
}

/** Заглушка вместо композера для гостя: объясняет, зачем аккаунт, и ведёт на вход. */
export function AuthCta({ title, description, action = 'Войти' }: AuthCtaProps) {
  const pathname = usePathname();
  const next = `?next=${encodeURIComponent(pathname)}`;

  return (
    <div className="px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-steel-border bg-card/40 px-4 py-4">
        <div className="min-w-0">
          <p className="text-base font-medium text-bone-text">{title}</p>
          {description && <p className="mt-0.5 text-sm text-fog-text">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/register${next}`}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
          >
            Регистрация
          </Link>
          <Link
            href={`/login${next}`}
            className={cn(buttonVariants({ size: 'sm' }), 'press rounded-full px-4')}
          >
            {action}
          </Link>
        </div>
      </div>
    </div>
  );
}
