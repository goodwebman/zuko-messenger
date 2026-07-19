'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { UIButton, ChevronDown, cn } from '@zuko/ui';
import { useMessages, MessageBubble, TypingIndicator } from '@/entities/message';
import {
  selectPresence,
  selectTyping,
  useConversationsSuspense,
} from '@/entities/conversation';
import { selectCurrentUser } from '@/entities/session';
import { useConversationSocket, MessageComposer } from '@/features/send-message';
import { PageHeader } from '@zuko/ui/app';
import { useAppSelector, isSameDay, formatDayLabel } from '@/shared/lib';

export function Chat({ conversationId }: { conversationId: string }) {
  const me = useAppSelector(selectCurrentUser);
  const { data: conversations } = useConversationsSuspense();
  const peer = conversations.find((c) => c.id === conversationId)?.peer;
  const online = useAppSelector(selectPresence(peer?.id));

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useMessages(conversationId);
  const socket = useConversationSocket(conversationId);

  const typingUsers = useAppSelector(selectTyping(conversationId));
  const peerTyping = peer ? typingUsers.includes(peer.id) : false;

  // pages: свежие→старые; для показа разворачиваем в старые→свежие.
  const messages = useMemo(
    () => data.pages.flatMap((page) => page.items).slice().reverse(),
    [data],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showJump, setShowJump] = useState(false);

  const lastMessage = messages.at(-1);
  const lastId = lastMessage?.id;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lastId, peerTyping]);

  // Пришло сообщение от собеседника в открытый диалог — сразу отмечаем прочитанным,
  // чтобы серверный unread не расходился с обнулённым бейджом.
  useEffect(() => {
    if (lastMessage && lastMessage.sender.id !== me?.id) socket.markRead();
  }, [lastId, lastMessage, me?.id, socket]);

  // Показать кнопку «вниз», когда пользователь отмотал ленту вверх.
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowJump(el.scrollHeight - el.scrollTop - el.clientHeight > 240);
  };

  const jumpToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="relative flex h-dvh flex-col border-x border-steel-border">
      <PageHeader
        title={
          peer ? (
            <Link
              href={`/profile/${peer.username}`}
              className="flex items-center gap-2 hover:underline"
            >
              {peer.displayName}
              {online && <span className="size-2 animate-online rounded-full bg-signal-lime" />}
            </Link>
          ) : (
            'Диалог'
          )
        }
      />

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-4"
      >
        {hasNextPage && (
          <div className="flex justify-center pb-2">
            <UIButton
              variant="ghost"
              size="sm"
              loading={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              Показать раньше
            </UIButton>
          </div>
        )}
        {messages.map((message, i) => {
          const prev = messages[i - 1];
          const showDay = !prev || !isSameDay(prev.createdAt, message.createdAt);
          return (
            <Fragment key={message.id}>
              {showDay && (
                <div className="sticky top-1 z-10 my-1.5 flex justify-center">
                  <span className="glass rounded-full border border-border/60 px-3.5 py-1.5 text-xs font-medium text-cloud-text shadow-e1">
                    {formatDayLabel(message.createdAt)}
                  </span>
                </div>
              )}
              <MessageBubble message={message} mine={message.sender.id === me?.id} />
            </Fragment>
          );
        })}
        {peerTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <button
        type="button"
        onClick={jumpToBottom}
        aria-label="Вниз к последним сообщениям"
        aria-hidden={!showJump}
        tabIndex={showJump ? 0 : -1}
        className={cn(
          'press glass-deep absolute bottom-24 right-4 z-20 flex size-11 items-center justify-center',
          'rounded-full border border-border text-cloud-text shadow-e3',
          'transition-all duration-(--dur-base) ease-smooth',
          showJump ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
        )}
      >
        <ChevronDown className="size-6" />
      </button>

      <MessageComposer socket={socket} />
    </div>
  );
}
