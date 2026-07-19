import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Conversation } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch<Conversation>('/conversations', { method: 'POST', body: { userId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.conversations }),
  });
}
