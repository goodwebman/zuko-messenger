'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/shared/lib';
import { selectIsAuthed } from './selectors';

export interface AuthGate {
  authed: boolean;
  /** Уводит на вход, запомнив текущий путь для возврата. */
  redirectToLogin: () => void;
  /**
   * Обёртка для действий «только для своих»: гостя уводит на /login и возвращает
   * `false`, залогиненному отдаёт `true` — вызывающий сам решает, что делать дальше.
   */
  ensureAuthed: () => boolean;
}

/** Единая точка гейтинга действий, требующих аккаунта (лайк, репост, чат, комментарий). */
export function useAuthGate(): AuthGate {
  const authed = useAppSelector(selectIsAuthed);
  const router = useRouter();
  const pathname = usePathname();

  const redirectToLogin = useCallback(() => {
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
  }, [router, pathname]);

  const ensureAuthed = useCallback(() => {
    if (authed) return true;
    redirectToLogin();
    return false;
  }, [authed, redirectToLogin]);

  return { authed, redirectToLogin, ensureAuthed };
}
