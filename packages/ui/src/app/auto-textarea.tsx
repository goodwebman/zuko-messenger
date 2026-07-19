'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface AutoTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows' | 'value' | 'className'> {
  value: string;
  /** Классы контейнера (отступы, типографика) — наследуются и полем, и его двойником. */
  className?: string;
}

/**
 * Textarea, растущая под контент. Высоту диктует невидимый span-двойник в той же
 * grid-ячейке — без замеров и useEffect, поэтому высота верна уже в первом кадре
 * и корректно схлопывается при внешнем сбросе значения.
 *
 * NB: у поля и двойника обнулены border/padding, а типографика задаётся на общем
 * контейнере — иначе метрики разъедутся и текст начнёт обрезаться.
 */
export const AutoTextarea = forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  function AutoTextarea({ className, value, ...props }, ref) {
    const cell = 'col-start-1 row-start-1 m-0 w-full border-0 p-0';

    return (
      <div
        className={cn(
          'grid max-h-[40vh] w-full overflow-y-auto text-base leading-7',
          className,
        )}
      >
        <span aria-hidden className={cn(cell, 'invisible whitespace-pre-wrap wrap-break-word')}>
          {/* Хвостовой пробел держит высоту при завершающем переносе строки. */}
          {`${value} `}
        </span>
        <textarea
          ref={ref}
          value={value}
          rows={1}
          className={cn(
            cell,
            'resize-none overflow-hidden bg-transparent font-[inherit] text-[length:inherit] leading-[inherit] text-cloud-text outline-none placeholder:text-fog-text',
          )}
          {...props}
        />
      </div>
    );
  },
);
