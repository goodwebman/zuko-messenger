import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Me, UpdateProfileInput, UserPublic } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';
import { useAppDispatch } from '@/shared/lib';
import { setUser } from '@/entities/session';

export function useUpdateProfile() {
  const qc = useQueryClient();
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      apiFetch<UserPublic>('/users/me', { method: 'PATCH', body: input }),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.user(updated.username), updated);
      const me = qc.getQueryData<Me>(queryKeys.me);
      if (me) {
        const next: Me = { ...me, ...updated };
        qc.setQueryData(queryKeys.me, next);
        dispatch(setUser(next));
      }
    },
  });
}
