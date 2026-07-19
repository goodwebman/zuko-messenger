'use client';

import type { CSSProperties } from 'react';
import { cn } from '../lib/cn';

/** Палитра по умолчанию: акцент + нейтраль, чтобы разлёт не выглядел одноцветным. */
const DEFAULT_COLORS = [
  'var(--color-signal-lime)',
  'var(--color-bone-text)',
  'color-mix(in oklab, var(--color-signal-lime) 60%, var(--color-bone-text))',
];

interface Particle {
  x: string;
  y: string;
  spin: string;
  size: number;
  delay: number;
  color: string;
  round: boolean;
}

/**
 * Раскладка частиц считается один раз на модуль и детерминированно.
 *
 * Никакого Math.random: случайные значения в рендере — это и рассинхрон
 * SSR/гидратации, и нечистый рендер. Равномерные углы с чередующимся радиусом
 * визуально неотличимы от «настоящего» рандома на 0.6 секунды.
 */
function buildParticles(count: number, radius: number, colors: readonly string[]): Particle[] {
  const RADIUS_STEPS = [1, 0.74, 0.9, 0.62];

  return Array.from({ length: count }, (_, i) => {
    // Нечётные частицы смещаем на пол-шага — иначе разлёт читается как «звёздочка».
    const jitter = i % 2 === 0 ? 9 : -9;
    const angle = ((360 / count) * i + jitter) * (Math.PI / 180);
    const distance = radius * (RADIUS_STEPS[i % RADIUS_STEPS.length] ?? 1);

    return {
      x: `${(Math.cos(angle) * distance).toFixed(1)}px`,
      y: `${(Math.sin(angle) * distance).toFixed(1)}px`,
      spin: `${i % 2 === 0 ? 200 : -160}deg`,
      size: i % 3 === 0 ? 7 : 5,
      delay: (i % 4) * 14,
      color: colors[i % colors.length] ?? DEFAULT_COLORS[0]!,
      round: i % 2 === 0,
    };
  });
}

export interface ParticleBurstProps {
  /** Сколько частиц разлетается. */
  count?: number;
  /** Радиус разлёта в px от центра. */
  radius?: number;
  colors?: readonly string[];
  /** Дёргается, когда отыграла последняя частица — можно размонтировать. */
  onDone?: () => void;
  className?: string;
}

/**
 * Разлёт «конфети» из центра родителя — отклик на разовое действие (лайк).
 *
 * Проигрывается ровно один раз за монтирование: повторный запуск делается
 * сменой `key` у вызывающей стороны, а не пропом-флагом. Так не нужен эффект
 * для перезапуска анимации и нет состояния «уже играл».
 *
 * Родитель обязан быть `position: relative`.
 */
export function ParticleBurst({
  count = 12,
  radius = 34,
  colors = DEFAULT_COLORS,
  onDone,
  className,
}: ParticleBurstProps) {
  const particles = buildParticles(count, radius, colors);
  // Длительность у всех одна, поэтому «последней» отыграет частица с макс. задержкой.
  const lastIndex = particles.reduce(
    (best, p, i) => (p.delay > (particles[best]?.delay ?? -1) ? i : best),
    0,
  );

  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute left-1/2 top-1/2 z-10 size-0 -translate-x-1/2 -translate-y-1/2',
        className,
      )}
    >
      <span className="absolute inset-0 -m-4 animate-burst-ring rounded-full border-2 border-signal-lime/70" />

      {particles.map((p, i) => (
        <span
          key={i}
          onAnimationEnd={i === lastIndex ? onDone : undefined}
          className={cn('absolute animate-burst', p.round ? 'rounded-full' : 'rounded-[1px]')}
          style={
            {
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animationDelay: `${p.delay}ms`,
              '--burst-x': p.x,
              '--burst-y': p.y,
              '--burst-spin': p.spin,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
