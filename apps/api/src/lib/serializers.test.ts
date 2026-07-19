import { describe, expect, it } from 'vitest';
import { toMessage, toNotification, toUserPublic } from './serializers';

const userRow = {
  id: 'u1',
  username: 'alice',
  displayName: 'Alice',
  avatarUrl: null,
  bio: 'hi',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('toUserPublic', () => {
  it('сериализует дату в ISO и не течёт лишними полями', () => {
    const dto = toUserPublic(userRow);
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(dto).not.toHaveProperty('passwordHash');
  });
});

describe('toMessage', () => {
  it('маппит readAt null и сериализует sender', () => {
    const dto = toMessage({
      id: 'm1',
      conversationId: 'c1',
      body: 'hey',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      readAt: null,
      sender: userRow,
    });
    expect(dto.readAt).toBeNull();
    expect(dto.sender.username).toBe('alice');
    expect(dto.createdAt).toBe('2026-01-02T00:00:00.000Z');
  });

  it('сериализует readAt-дату', () => {
    const dto = toMessage({
      id: 'm2',
      conversationId: 'c1',
      body: 'hey',
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      readAt: new Date('2026-01-03T00:00:00.000Z'),
      sender: userRow,
    });
    expect(dto.readAt).toBe('2026-01-03T00:00:00.000Z');
  });
});

describe('toNotification', () => {
  it('маппит тип и актора', () => {
    const dto = toNotification({
      id: 'n1',
      type: 'LIKE',
      postId: 'p1',
      messageId: null,
      conversationId: null,
      read: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      actor: userRow,
    });
    expect(dto.type).toBe('LIKE');
    expect(dto.actor.id).toBe('u1');
    expect(dto.postId).toBe('p1');
  });
});
