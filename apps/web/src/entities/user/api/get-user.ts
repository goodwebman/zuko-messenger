import { useSuspenseQuery } from '@tanstack/react-query';
import type { UserPublic } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';

export const fetchUser = (username: string): Promise<UserPublic> =>
  apiFetch<UserPublic>(`/users/${username}`);

export function useUserSuspense(username: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.user(username),
    queryFn: () => fetchUser(username),
  });
}
