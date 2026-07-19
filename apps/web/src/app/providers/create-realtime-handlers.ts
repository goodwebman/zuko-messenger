import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { ToastVariant } from '@zuko/ui';
import type {
  Message,
  MessageReadPayload,
  Notification,
  PresencePayload,
  TypingPayload,
} from '@zuko/contracts';
import type { AppDispatch } from '@/app/store';
import { queryKeys } from '@/shared/config';
import {
  appendMessageToCache,
  applyIncomingToConversations,
  applyReadReceipt,
  bumpConversationUnread,
  setConnected,
  setPresence,
  setTyping,
} from '@/entities/conversation';
import { notificationToast } from '@/entities/notification';

export interface RealtimeDeps {
  qc: QueryClient;
  dispatch: AppDispatch;
  toast: (message: ReactNode, variant?: ToastVariant) => void;
  currentUserId: string;
  /** Читается лениво (ref), чтобы хендлеры не пересоздавались при смене активного диалога. */
  getActiveConversationId: () => string | null;
}

/**
 * Чистая маршрутизация realtime-событий: транспорт (socket.on/off) остаётся в провайдере,
 * а «куда какое событие едет» — здесь, где это можно юнит-тестировать без React и сокета.
 *
 * Данные → TanStack Query (кэш сообщений/диалогов), UI-состояние → Redux (presence/typing).
 */
export function createRealtimeHandlers(deps: RealtimeDeps) {
  const { qc, dispatch, toast, currentUserId, getActiveConversationId } = deps;

  return {
    onConnect: () => dispatch(setConnected(true)),
    onDisconnect: () => dispatch(setConnected(false)),

    // Сообщение приходит только тем, кто в комнате диалога (открыл чат) — включая отправителя.
    // Непрочитанные тут не растим: раз ты в комнате, ты его видишь (read эмитит виджет чата).
    onMessageNew: (message: Message) => {
      appendMessageToCache(qc, message);
      applyIncomingToConversations(qc, message, { bumpUnread: false });
    },

    // Единственный канал для фоновых диалогов (ты не в комнате) — по нему и растёт бейдж.
    onNotificationNew: (n: Notification) => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications });
      if (n.type === 'MESSAGE' && n.conversationId) {
        const active = getActiveConversationId() === n.conversationId;
        if (!active) {
          bumpConversationUnread(qc, n.conversationId); // мгновенный бейдж
          void qc.invalidateQueries({ queryKey: queryKeys.conversations }); // догоняем превью/порядок
        }
      }
      toast(notificationToast(n), 'default');
    },

    onTyping: (p: TypingPayload & { typing: boolean }) =>
      dispatch(setTyping({ conversationId: p.conversationId, userId: p.userId, typing: p.typing })),

    onPresence: (p: PresencePayload) =>
      dispatch(setPresence({ userId: p.userId, online: p.online })),

    onMessageRead: (p: MessageReadPayload) => {
      // Собеседник прочитал — обновляем read-receipt только если читал не я сам.
      if (p.userId !== currentUserId) applyReadReceipt(qc, p.conversationId, p.readAt);
    },
  };
}

export type RealtimeHandlers = ReturnType<typeof createRealtimeHandlers>;
