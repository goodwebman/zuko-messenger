import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandLogo } from '@zuko/ui/app';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Лаймовое свечение за карточкой — тот же приём глубины, что и в EmptyState. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 size-144 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-lime/6 blur-[120px]"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <BrandLogo className="text-3xl" />
        </div>

        {children}

        <p className="mt-6 text-center text-sm text-fog-text">
          <Link href="/feed" className="transition-colors hover:text-cloud-text">
            Продолжить как гость →
          </Link>
        </p>
      </div>
    </div>
  );
}
