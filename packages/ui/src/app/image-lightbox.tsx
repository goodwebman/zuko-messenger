'use client';

import { useMemo } from 'react';
import Lightbox, { type SlotStyles } from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';

/**
 * Тема просмотрщика через собственные CSS-переменные библиотеки: подложка —
 * ink-well с прозрачностью, кнопки — bone-text с lime-ховером. Правим переменные,
 * а не классы: апгрейд мажора не сломает вёрстку.
 */
const styles: SlotStyles = {
  root: {
    '--yarl__color_backdrop': 'color-mix(in oklab, #121317 88%, transparent)',
    '--yarl__color_button': 'var(--color-cloud-text)',
    '--yarl__color_button_active': 'var(--color-signal-lime)',
    '--yarl__color_button_disabled': 'var(--color-fog-text)',
    '--yarl__counter_color': 'var(--color-ash-text)',
    // Иконки крупнее дефолтных 32px — попадать по стрелкам на мобилке проще.
    '--yarl__icon_size': '36px',
  },
  container: { backdropFilter: 'blur(8px) saturate(1.2)' },
};

const labels = {
  Previous: 'Предыдущее фото',
  Next: 'Следующее фото',
  Close: 'Закрыть',
  'Zoom in': 'Приблизить',
  'Zoom out': 'Отдалить',
  '{index} of {total}': 'Фото {index} из {total}',
};

/** finite убирает зацикливание: на 2–4 фото круговая карусель дезориентирует. */
const carousel = { finite: true, padding: '16px' } as const;
const controller = { closeOnBackdropClick: true, closeOnPullDown: true } as const;
const zoom = { maxZoomPixelRatio: 4, scrollToZoom: true, doubleClickMaxStops: 2 } as const;
const animation = { fade: 200, swipe: 300 } as const;
const plugins = [Zoom, Counter];

export interface ImageLightboxProps {
  images: readonly string[];
  /** Индекс открытого фото; `null` — просмотрщик закрыт. */
  index: number | null;
  onClose: () => void;
}

/**
 * Полноэкранный просмотр фото: стрелки/свайп, зум колесом, двойным кликом и щипком,
 * счётчик. Состоянием владеет вызывающая сторона — компонент чисто контролируемый.
 */
export function ImageLightbox({ images, index, onClose }: ImageLightboxProps) {
  /**
   * Массив слайдов обязан быть стабильным по ссылке: YARL сравнивает `slides`
   * через `!==` прямо в рендере и на новой ссылке сбрасывает текущий слайд
   * обратно на `index`. Вызывающие передают `images` литералом (`slice`, `[url]`),
   * поэтому мемоизируем здесь, а не перекладываем это на них.
   */
  const imagesKey = images.join('\n');
  const slides = useMemo(() => imagesKey.split('\n').map((src) => ({ src })), [imagesKey]);

  return (
    <Lightbox
      open={index !== null}
      index={index ?? 0}
      close={onClose}
      slides={slides}
      plugins={plugins}
      carousel={carousel}
      controller={controller}
      zoom={zoom}
      animation={animation}
      styles={styles}
      labels={labels}
    />
  );
}
