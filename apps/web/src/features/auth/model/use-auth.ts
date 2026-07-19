import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LoginInput, Me, RegisterInput } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';
import { useAppDispatch } from '@/shared/lib';
import { clearUser, setUser } from '@/entities/session';

export function useLogin() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => apiFetch<Me>('/auth/login', { method: 'POST', body: input }),
    onSuccess: (me) => {
      dispatch(setUser(me));
      qc.setQueryData(queryKeys.me, me);
    },
  });
}

export function useRegister() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiFetch<Me>('/auth/register', { method: 'POST', body: input }),
    onSuccess: (me) => {
      dispatch(setUser(me));
      qc.setQueryData(queryKeys.me, me);
    },
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ ok: true }>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      dispatch(clearUser());
      qc.clear();
    },
  });
}
