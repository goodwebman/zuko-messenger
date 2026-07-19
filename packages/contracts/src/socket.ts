import type { Message } from './message';
import type { Notification } from './notification';

/** Полезные нагрузки событий. */
export interface TypingPayload {
  conversationId: string;
  userId: string;
}

export interface PresencePayload {
  userId: string;
  online: boolean;
}

export interface MessageReadPayload {
  conversationId: string;
  /** Кто прочитал. */
  userId: string;
  readAt: string;
}

/** Сервер → клиент. */
export interface ServerToClientEvents {
  'message:new': (message: Message) => void;
  'message:read': (payload: MessageReadPayload) => void;
  typing: (payload: TypingPayload & { typing: boolean }) => void;
  'presence:update': (payload: PresencePayload) => void;
  'notification:new': (notification: Notification) => void;
}

/** Клиент → сервер (последний аргумент — опциональный ack). */
export interface ClientToServerEvents {
  'conversation:join': (conversationId: string) => void;
  'conversation:leave': (conversationId: string) => void;
  'message:send': (
    payload: { conversationId: string; body: string },
    ack?: (res: { ok: true; message: Message } | { ok: false; error: string }) => void,
  ) => void;
  'typing:start': (conversationId: string) => void;
  'typing:stop': (conversationId: string) => void;
  'message:read': (conversationId: string) => void;
}

/** Данные, привязанные к сокету на сервере. */
export interface SocketData {
  userId: string;
}

/** Имена событий как константы, чтобы не хардкодить строки. */
export const SOCKET_EVENTS = {
  messageNew: 'message:new',
  messageRead: 'message:read',
  typing: 'typing',
  presenceUpdate: 'presence:update',
  notificationNew: 'notification:new',
  conversationJoin: 'conversation:join',
  conversationLeave: 'conversation:leave',
  messageSend: 'message:send',
  typingStart: 'typing:start',
  typingStop: 'typing:stop',
} as const;
