'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { cn } from '@zuko/ui';

/**
 * Просмотрщик грузим по требованию: в ленте он нужен единицам, а тянет за собой
 * ~25 КБ JS. Импорт минуя баррель `@zuko/ui/app` — иначе в чанк уедет весь прикладной слой китa.
 */
const ImageLightbox = dynamic(
  () => import('@zuko/ui/app/image-lightbox').then((m) => m.ImageLightbox),
  { ssr: false },
);

/**
 * Сетка вложенных фото: 1 — во всю ширину, 3 — первое широкое, 2/4 — плитка.
 * Клик открывает полноэкранный просмотр с листанием и зумом.
 */
export function PostImages({ images }: { images: string[] }) {
  const [index, setIndex] = useState<number | null>(null);
  // Просмотрщик остаётся в дереве после первого открытия — иначе на закрытии
  // компонент размонтируется раньше, чем доиграет fade-out.
  const [mounted, setMounted] = useState(false);

  const items = images.slice(0, 4);
  const oddLead = items.length % 2 === 1; // 1 или 3 → первое фото на всю ширину

  const open = (i: number) => {
    setMounted(true);
    setIndex(i);
  };

  return (
    <>
      <div className="mt-3 grid max-w-120 grid-cols-2 gap-1 overflow-hidden rounded-xl border border-steel-border">
        {items.map((src, i) => {
          const wide = oddLead && i === 0;
          return (
            <button
              key={src}
              type="button"
              onClick={() => open(i)}
              aria-label={`Открыть фото ${i + 1} из ${items.length}`}
              className={cn(
                'group relative block cursor-zoom-in overflow-hidden bg-ink-well',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal-lime',
                wide ? 'col-span-2 aspect-4/3' : 'aspect-square',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Фото ${i + 1} из ${items.length}`}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </button>
          );
        })}
      </div>

      {mounted && (
        <ImageLightbox images={items} index={index} onClose={() => setIndex(null)} />
      )}
    </>
  );
}
