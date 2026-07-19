'use client';

import type { Conversation } from '@zuko/contracts';
import {
  ConversationItem,
  selectPresence,
  selectUnread,
  useConversationsSuspense,
} from '@/entities/conversation';
import { EmptyState } from '@zuko/ui/app';
import { useAppSelector } from '@/shared/lib';

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const unread = useAppSelector(selectUnread(conversation.id));
  const online = useAppSelector(selectPresence(conversation.peer.id));
  return (
    <ConversationItem
      conversation={conversation}
      unreadCount={unread || conversation.unreadCount}
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
