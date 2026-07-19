import { cn } from '../lib/cn';

/** Путь к растру знака в `public/` приложения-потребителя. */
const MARK_SRC = '/logo-mark.png';

/**
 * Знак бренда — растр с альфой. Размер по умолчанию в em, чтобы тянулся
 * за `text-*` родителя; можно перебить классом (`size-10`).
 *
 * NB: намеренно нативный `<img>`, а не `next/image` — ui-kit не должен зависеть
 * от фреймворка. Оптимизировать тут нечего: знак отдаётся один раз в двух
 * размерах и весит меньше, чем накладные расходы на `/_next/image`.
 */
export function BrandMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MARK_SRC}
      alt=""
      aria-hidden
      width={256}
      height={256}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={cn('h-[1.35em] w-[1.35em] animate-mark', className)}
    />
  );
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-satoshi text-xl font-semibold tracking-tight text-bone-text',
        className,
      )}
    >
      <BrandMark priority />
      Zuko
    </span>
  );
}
