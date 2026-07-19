'use client';

import { useRouter } from 'next/navigation';
import { UIButton } from '@zuko/ui';
import { useStartConversation } from '../model/use-start-conversation';

export function StartChatButton({ userId }: { userId: string }) {
  const router = useRouter();
  const startChat = useStartConversation();

  return (
    <UIButton
      size="sm"
      loading={startChat.isPending}
      onClick={() =>
        startChat.mutate(userId, {
          onSuccess: (conversation) => router.push(`/messages/${conversation.id}`),
        })
      }
    >
      Написать
    </UIButton>
  );
}
