import Link from 'next/link';
import type { Conversation } from '@zuko/contracts';
import { cn } from '@zuko/ui';
import { UserAvatar } from '@/entities/user';
import { timeAgo } from '@/shared/lib';

interface ConversationItemProps {
  conversation: Conversation;
  unreadCount: number;
  online: boolean;
}

export function ConversationItem({ conversation, unreadCount, online }: ConversationItemProps) {
  const { peer, lastMessage } = conversation;
  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="flex items-center gap-3 border-b border-steel-border px-4 py-3 transition-colors hover:bg-accent/50 active:bg-accent"
    >
      <div className="relative">
        <UserAvatar user={peer} />
        {online && (
          <span className="absolute bottom-0 right-0 size-2.5 animate-online rounded-full border-2 border-background bg-signal-lime" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-bone-text">{peer.displayName}</span>
          {lastMessage && (
            <span className="shrink-0 text-xs text-fog-text">{timeAgo(lastMessage.createdAt)}</span>
          )}
        </div>
        <p className={cn('truncate text-sm', unreadCount > 0 ? 'text-cloud-text' : 'text-fog-text')}>
          {lastMessage?.body ?? 'Нет сообщений'}
        </p>
      </div>
      {unreadCount > 0 && (
        <span className="flex size-5 animate-pop items-center justify-center rounded-full bg-signal-lime text-xs font-medium text-ink-well shadow-e1">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
