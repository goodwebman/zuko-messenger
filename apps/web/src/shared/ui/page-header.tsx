import type { ReactNode } from 'react';

export function PageHeader({ title, children }: { title: ReactNode; children?: ReactNode }) {
  return (
    <header className="glass sticky top-0 z-10 border-b border-steel-border px-4 py-3 shadow-e1">
      <div className="flex items-center gap-3">
        <h1 className="font-satoshi text-lg font-medium tracking-tight text-bone-text">{title}</h1>
        {children}
      </div>
    </header>
  );
}
