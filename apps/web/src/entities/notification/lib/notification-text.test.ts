import { describe, expect, it } from 'vitest';
import type { Notification, UserPublic } from '@zuko/contracts';
import { notificationLabel, notificationTarget, notificationToast } from './notification-text';

const actor: UserPublic = {
  id: 'u1',
  username: 'bob',
  displayName: 'Bob',
  avatarUrl: null,
  bio: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const make = (over: Partial<Notification>): Notification => ({
  id: 'n1',
  type: 'LIKE',
  actor,
  postId: null,
  messageId: null,
  conversationId: null,
  read: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

describe('notification-text', () => {
  it('label по типам', () => {
    expect(notificationLabel(make({ type: 'LIKE' }))).toContain('лайкнул');
    expect(notificationLabel(make({ type: 'COMMENT' }))).toContain('прокомментировал');
    expect(notificationLabel(make({ type: 'REPOST' }))).toContain('репост');
    expect(notificationLabel(make({ type: 'MESSAGE' }))).toContain('сообщение');
  });

  it('toast включает имя актора', () => {
    expect(notificationToast(make({ type: 'LIKE' }))).toBe('Bob лайкнул ваш пост');
    expect(notificationToast(make({ type: 'MESSAGE' }))).toBe('Bob: новое сообщение');
  });

  it('target: сообщение → диалог', () => {
    expect(notificationTarget(make({ type: 'MESSAGE', conversationId: 'c1' }))).toBe('/messages/c1');
  });
  it('target: лайк → пост', () => {
    expect(notificationTarget(make({ type: 'LIKE', postId: 'p1' }))).toBe('/post/p1');
  });
  it('target: фолбэк', () => {
    expect(notificationTarget(make({ type: 'LIKE' }))).toBe('/notifications');
  });
});
