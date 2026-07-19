import type { ReactNode } from 'react';
import { BrandLogo } from '@/shared/ui';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <BrandLogo className="text-2xl" />
        </div>
        {children}
      </div>
    </div>
  );
}
