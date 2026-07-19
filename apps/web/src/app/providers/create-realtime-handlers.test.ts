import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { Conversation, Notification, UserPublic } from '@zuko/contracts';
import { queryKeys } from '@/shared/config';
import { createRealtimeHandlers, type RealtimeDeps } from './create-realtime-handlers';

const user = (id: string): UserPublic => ({
  id,
  username: id,
  displayName: id,
  avatarUrl: null,
  bio: null,
  createdAt: '2026-01-01T00:00:00.000Z',
});

const conv = (id: string, unread: number): Conversation => ({
  id,
  peer: user(`peer-${id}`),
  lastMessage: null,
  unreadCount: unread,
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const messageNotification = (conversationId: string): Notification => ({
  id: 'n1',
  type: 'MESSAGE',
  actor: user('peer'),
  conversationId,
  postId: null,
  messageId: null,
  read: false,
  createdAt: '2026-01-01T00:00:00.000Z',
});

function setup(active: string | null = null, deps: Partial<RealtimeDeps> = {}) {
  const qc = new QueryClient();
  qc.setQueryData<Conversation[]>(queryKeys.conversations, [conv('c1', 0)]);
  const dispatch = vi.fn();
  const toast = vi.fn();
  const handlers = createRealtimeHandlers({
    qc,
    dispatch,
    toast,
    currentUserId: 'me',
    getActiveConversationId: () => active,
    ...deps,
  });
  const unread = () =>
    qc.getQueryData<Conversation[]>(queryKeys.conversations)?.find((c) => c.id === 'c1')?.unreadCount;
  return { qc, dispatch, toast, handlers, unread };
}

describe('createRealtimeHandlers', () => {
  it('notification о сообщении в фоновом диалоге растит бейдж и тостит', () => {
    const { handlers, toast, unread } = setup(null);
    handlers.onNotificationNew(messageNotification('c1'));
    expect(unread()).toBe(1);
    expect(toast).toHaveBeenCalledOnce();
  });

  it('notification о сообщении в активном диалоге не трогает бейдж', () => {
    const { handlers, unread } = setup('c1');
    handlers.onNotificationNew(messageNotification('c1'));
    expect(unread()).toBe(0);
  });
});
