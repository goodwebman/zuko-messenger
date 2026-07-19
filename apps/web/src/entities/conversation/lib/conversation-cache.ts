import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { Conversation, Message, Paginated } from '@zuko/contracts';
import { queryKeys } from '@/shared/config';

/** Кэш сообщений диалога: страницы идут свежие→старые (как отдаёт cursor-пагинация). */
export type MessagesCache = InfiniteData<Paginated<Message>>;

// ── Чистые обновления (юнит-тестируемы независимо от QueryClient) ─────────────

/** Добавляет сообщение в начало первой (свежей) страницы; дедуп по id. */
export function prependMessage(cache: MessagesCache, message: Message): MessagesCache {
  const [first, ...rest] = cache.pages;
  if (!first) return cache;
  if (cache.pages.some((page) => page.items.some((m) => m.id === message.id))) return cache;
  return { ...cache, pages: [{ ...first, items: [message, ...first.items] }, ...rest] };
}

/** Применяет входящее сообщение к списку диалогов: обновляет превью, порядок и (опц.) непрочитанные. */
export function applyIncoming(
  list: Conversation[],
  message: Message,
  opts: { bumpUnread: boolean },
): Conversation[] {
  const idx = list.findIndex((c) => c.id === message.conversationId);
  if (idx === -1) return list; // диалога ещё нет в кэше — подтянет рефетч
  const conv = list[idx];
  const updated: Conversation = {
    ...conv,
    lastMessage: message,
    updatedAt: message.createdAt,
    unreadCount: opts.bumpUnread ? conv.unreadCount + 1 : conv.unreadCount,
  };
  return [updated, ...list.slice(0, idx), ...list.slice(idx + 1)];
}

/** +1 к непрочитанным диалога (когда самого сообщения нет — пришло только уведомление). */
export function bumpUnread(list: Conversation[], conversationId: string): Conversation[] {
  return list.map((c) =>
    c.id === conversationId ? { ...c, unreadCount: c.unreadCount + 1 } : c,
  );
}

/** Обнуляет непрочитанные конкретного диалога. */
export function clearUnread(list: Conversation[], conversationId: string): Conversation[] {
  return list.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c));
}

/** Проставляет readAt непрочитанным сообщениям (эхо message:read от собеседника). */
export function applyRead(cache: MessagesCache, readAt: string): MessagesCache {
  return {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      items: page.items.map((m) => (m.readAt ? m : { ...m, readAt })),
    })),
  };
}

/** Единый производный счётчик непрочитанных по всем диалогам. */
export function totalUnread(list: Conversation[] | undefined): number {
  return list?.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;
}

// ── Обёртки над QueryClient ───────────────────────────────────────────────────

export function appendMessageToCache(qc: QueryClient, message: Message): void {
  qc.setQueryData<MessagesCache>(queryKeys.messages(message.conversationId), (cache) =>
    cache ? prependMessage(cache, message) : cache,
  );
}

export function applyIncomingToConversations(
  qc: QueryClient,
  message: Message,
  opts: { bumpUnread: boolean },
): void {
  qc.setQueryData<Conversation[]>(queryKeys.conversations, (list) =>
    list ? applyIncoming(list, message, opts) : list,
  );
}

export function bumpConversationUnread(qc: QueryClient, conversationId: string): void {
  qc.setQueryData<Conversation[]>(queryKeys.conversations, (list) =>
    list ? bumpUnread(list, conversationId) : list,
  );
}

export function clearConversationUnread(qc: QueryClient, conversationId: string): void {
  qc.setQueryData<Conversation[]>(queryKeys.conversations, (list) =>
    list ? clearUnread(list, conversationId) : list,
  );
}

export function applyReadReceipt(qc: QueryClient, conversationId: string, readAt: string): void {
  qc.setQueryData<MessagesCache>(queryKeys.messages(conversationId), (cache) =>
    cache ? applyRead(cache, readAt) : cache,
  );
}
