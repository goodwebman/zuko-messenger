import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Рецепт классов для элемента панели действий поста (лайк/коммент/репост/ссылка).
 *
 * Не компонент, а именно классы: часть этих элементов — `<button>`, часть —
 * роутерная `<Link>`, и ui-kit про роутинг знать не должен. Тот же приём, что
 * с `buttonVariants`.
 *
 * Аффорданс кликабельности собран из трёх сигналов сразу — одного мало на
 * тёмном фоне: подложка (`hover:bg-accent`), осветление текста и подрост иконки
 * (см. `actionItemIcon`, работает через `group` в базе).
 */
export const actionItemVariants = cva(
  [
    'group press relative flex items-center gap-2 rounded-lg px-3 py-2 tabular-nums',
    'transition-colors duration-(--dur-base) ease-smooth',
    'hover:bg-accent',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-lime/70',
  ].join(' '),
  {
    variants: {
      /** Действие уже применено (лайк стоит) — элемент подсвечен акцентом. */
      active: {
        true: 'text-signal-lime',
        false: 'hover:text-bone-text',
      },
    },
    defaultVariants: { active: false },
  },
);

export type ActionItemVariants = VariantProps<typeof actionItemVariants>;

/** Класс для иконки внутри `actionItemVariants` — реагирует на ховер родителя. */
export const actionItemIcon =
  'size-5.5 transition-transform duration-(--dur-base) ease-smooth group-hover:scale-115';
