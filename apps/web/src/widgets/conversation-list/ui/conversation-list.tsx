'use client';

import type { Conversation } from '@zuko/contracts';
import {
  ConversationItem,
  selectPresence,
  useConversationsSuspense,
} from '@/entities/conversation';
import { EmptyState } from '@zuko/ui/app';
import { useAppSelector } from '@/shared/lib';

function ConversationRow({ conversation }: { conversation: Conversation }) {
  // unreadCount — из кэша conversations (единый источник), realtime патчит его на месте.
  const online = useAppSelector(selectPresence(conversation.peer.id));
  return (
    <ConversationItem
      conversation={conversation}
      unreadCount={conversation.unreadCount}
      online={online}
    />
  );
}

export function ConversationList() {
  const { data: conversations } = useConversationsSuspense();

  if (conversations.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          title="Нет диалогов"
          hint="Откройте профиль пользователя и нажмите «Написать»"
        />
      </div>
    );
  }

  return (
    <div>
      {conversations.map((conversation) => (
        <ConversationRow key={conversation.id} conversation={conversation} />
      ))}
    </div>
  );
}
