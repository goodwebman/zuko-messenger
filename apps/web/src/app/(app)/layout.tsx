'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/widgets/app-shell';
import { selectSessionInitialized } from '@/entities/session';
import { useAppSelector } from '@/shared/lib';

/**
 * Гостя не выкидываем: лента, посты и профили открыты на чтение, приватные
 * разделы отсекает middleware по refresh-cookie. Ждём только инициализации
 * сессии — иначе шелл на кадр мигнёт гостевым состоянием у залогиненного.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const initialized = useAppSelector(selectSessionInitialized);

  if (!initialized) return null;
  return <AppShell>{children}</AppShell>;
}
