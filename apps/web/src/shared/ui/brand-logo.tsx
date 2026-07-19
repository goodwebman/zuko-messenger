import { cn } from '@zuko/ui';

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-satoshi text-xl font-semibold tracking-tight text-bone-text',
        className,
      )}
    >
      <span aria-hidden className="inline-block animate-mark text-signal-lime">
        ◤
      </span>
      Zuko
    </span>
  );
}
