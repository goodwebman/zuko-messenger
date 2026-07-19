import type { ReactNode } from 'react';

export function EmptyState({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-steel-border px-6 py-16 text-center">
      <div className="relative mb-1 flex size-14 items-center justify-center">
        {/* Мягкое lime-свечение за марком — глубина без плоского фона. */}
        <span aria-hidden className="absolute inset-0 rounded-full bg-signal-lime/10 blur-xl" />
        <span aria-hidden className="animate-mark text-3xl text-signal-lime">
          ◤
        </span>
      </div>
      <p className="text-cloud-text">{title}</p>
      {hint && <p className="text-sm text-fog-text">{hint}</p>}
    </div>
  );
}
