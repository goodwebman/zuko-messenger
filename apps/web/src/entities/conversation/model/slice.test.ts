import { describe, expect, it } from 'vitest';
import {
  chatReducer,
  incrementUnread,
  setActiveConversation,
  setPresence,
  setTyping,
  setUnreadMap,
} from './slice';

const initial = chatReducer(undefined, { type: '@@INIT' });

describe('chatSlice', () => {
  it('incrementUnread повышает счётчик неактивного диалога', () => {
    const state = chatReducer(initial, incrementUnread('c1'));
    expect(state.unread.c1).toBe(1);
  });

  it('incrementUnread игнорирует активный диалог', () => {
    const active = chatReducer(initial, setActiveConversation('c1'));
    const state = chatReducer(active, incrementUnread('c1'));
    expect(state.unread.c1).toBe(0);
  });

  it('setActiveConversation обнуляет непрочитанные', () => {
    const withUnread = chatReducer(initial, setUnreadMap({ c1: 5 }));
    const state = chatReducer(withUnread, setActiveConversation('c1'));
    expect(state.unread.c1).toBe(0);
    expect(state.activeConversationId).toBe('c1');
  });

  it('setTyping добавляет и убирает печатающих без дублей', () => {
    let state = chatReducer(initial, setTyping({ conversationId: 'c1', userId: 'u1', typing: true }));
    state = chatReducer(state, setTyping({ conversationId: 'c1', userId: 'u1', typing: true }));
    expect(state.typing.c1).toEqual(['u1']);
    state = chatReducer(state, setTyping({ conversationId: 'c1', userId: 'u1', typing: false }));
    expect(state.typing.c1).toEqual([]);
  });

  it('setPresence обновляет онлайн-статус', () => {
    const state = chatReducer(initial, setPresence({ userId: 'u2', online: true }));
    expect(state.presence.u2).toBe(true);
  });
});
