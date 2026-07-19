'use client';

import { useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UISpinner } from '@zuko/ui';
import type { Me } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';
import { useAppDispatch, useAppSelector } from '@/shared/lib';
import { clearUser, selectSessionInitialized, setUser } from '@/entities/session';

/** Загружает текущую сессию (/auth/me) и кладёт юзера в стор. */
export function SessionGate({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector(selectSessionInitialized);

  const { data, isSuccess, isError } = useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiFetch<Me>('/auth/me'),
    retry: false,
    staleTime: Infinity,
  });

  // Единый синк результата /auth/me в Redux (сессию читают синхронно socket и множество
  // компонентов). Один эффект вместо двух — нет гонки порядка и лишнего кадра рассинхрона.
  useEffect(() => {
    if (isSuccess) dispatch(setUser(data));
    else if (isError) dispatch(clearUser());
  }, [isSuccess, isError, data, dispatch]);

  if (!initialized) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <UISpinner />
      </div>
    );
  }

  return <>{children}</>;
}
