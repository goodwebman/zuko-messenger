'use client';

import { useRouter } from 'next/navigation';
import { UIButton } from '@zuko/ui';
import { useAuthGate } from '@/entities/session';
import { useStartConversation } from '../model/use-start-conversation';

export function StartChatButton({ userId }: { userId: string }) {
  const router = useRouter();
  const startChat = useStartConversation();
  const { ensureAuthed } = useAuthGate();

  const start = () => {
    if (!ensureAuthed()) return;
    startChat.mutate(userId, {
      onSuccess: (conversation) => router.push(`/messages/${conversation.id}`),
    });
  };

  return (
    <UIButton size="sm" loading={startChat.isPending} onClick={start}>
      Написать
    </UIButton>
  );
}
