'use client';

import { createPortal } from 'react-dom';

/**
 * Затемнение под модалку. Рендерим порталом в body, а не как `UIDialog.Overlay`
 * рядом с триггером: `backdrop-filter` у любого предка (утилита glass/glass-deep
 * на сайдбаре и хедерах) создаёт containing block для position:fixed, и оверлей
 * накрыл бы только эту колонку, а не экран.
 */
export function DialogBackdrop() {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      aria-hidden
      className="fixed inset-0 z-40 bg-ink-well/70 backdrop-blur-sm backdrop-saturate-150"
    />,
    document.body,
  );
}
