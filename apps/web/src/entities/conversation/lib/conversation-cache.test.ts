import { describe, expect, it } from 'vitest';
import type { Conversation, Message, UserPublic } from '@zuko/contracts';
import {
  applyIncoming,
  applyRead,
  bumpUnread,
  clearUnread,
  prependMessage,
  totalUnread,
  type MessagesCache,
} from './conversation-cache';

const user = (id: string): UserPublic => ({
  id,
  username: id,
  displayName: id,
  avatarUrl: null,
  bio: null,
  createdAt: '2026-01-01T00:00:00.000Z',
});

const msg = (id: string, conversationId: string, senderId: string): Message => ({
  id,
  conversationId,
  body: `body-${id}`,
  sender: user(senderId),
  createdAt: `2026-01-0${id}T00:00:00.000Z`,
  readAt: null,
});

const conv = (id: string, unread: number): Conversation => ({
  id,
  peer: user(`peer-${id}`),
  lastMessage: null,
  unreadCount: unread,
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const cache = (messages: Message[]): MessagesCache => ({
  pages: [{ items: messages, nextCursor: null }],
  pageParams: [undefined],
});

describe('prependMessage', () => {
  it('добавляет сообщение в начало свежей страницы', () => {
    const next = prependMessage(cache([msg('1', 'c1', 'u1')]), msg('2', 'c1', 'u1'));
    expect(next.pages[0].items.map((m) => m.id)).toEqual(['2', '1']);
  });

  it('игнорирует дубль по id (эхо своего же сообщения)', () => {
    const existing = msg('1', 'c1', 'u1');
    const next = prependMessage(cache([existing]), existing);
    expect(next.pages[0].items).toHaveLength(1);
  });
});

describe('applyIncoming', () => {
  it('обновляет превью, поднимает диалог наверх и растит unread', () => {
    const list = [conv('c1', 0), conv('c2', 0)];
    const next = applyIncoming(list, msg('m', 'c2', 'peer'), { bumpUnread: true });
    expect(next.map((c) => c.id)).toEqual(['c2', 'c1']);
    expect(next[0].unreadCount).toBe(1);
    expect(next[0].lastMessage?.id).toBe('m');
  });

  it('не растит unread для активного/своего диалога', () => {
    const list = [conv('c1', 0)];
    const next = applyIncoming(list, msg('m', 'c1', 'me'), { bumpUnread: false });
    expect(next[0].unreadCount).toBe(0);
  });

  it('не трогает список, если диалога нет в кэше', () => {
    const list = [conv('c1', 0)];
    expect(applyIncoming(list, msg('m', 'cX', 'peer'), { bumpUnread: true })).toBe(list);
  });
});

describe('bumpUnread / clearUnread / totalUnread', () => {
  it('bumpUnread растит счётчик нужного диалога', () => {
    expect(bumpUnread([conv('c1', 2)], 'c1')[0].unreadCount).toBe(3);
  });

  it('clearUnread обнуляет нужный диалог', () => {
    expect(clearUnread([conv('c1', 5)], 'c1')[0].unreadCount).toBe(0);
  });

  it('totalUnread суммирует по всем диалогам', () => {
    expect(totalUnread([conv('c1', 2), conv('c2', 3)])).toBe(5);
    expect(totalUnread(undefined)).toBe(0);
  });
});

describe('applyRead', () => {
  it('проставляет readAt непрочитанным сообщениям', () => {
    const next = applyRead(cache([msg('1', 'c1', 'me')]), '2026-02-01T00:00:00.000Z');
    expect(next.pages[0].items[0].readAt).toBe('2026-02-01T00:00:00.000Z');
  });
});
