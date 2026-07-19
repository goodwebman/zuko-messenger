'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/widgets/app-shell';
import { selectCurrentUser, selectSessionInitialized } from '@/entities/session';
import { useAppSelector } from '@/shared/lib';

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const initialized = useAppSelector(selectSessionInitialized);

  useEffect(() => {
    if (initialized && !user) router.replace('/login');
  }, [initialized, user, router]);

  if (!user) return null;
  return <AppShell>{children}</AppShell>;
}
