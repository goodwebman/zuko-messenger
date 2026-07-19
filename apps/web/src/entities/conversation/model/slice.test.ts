import { describe, expect, it } from 'vitest';
import {
  chatReducer,
  setActiveConversation,
  setConnected,
  setPresence,
  setTyping,
} from './slice';

const initial = chatReducer(undefined, { type: '@@INIT' });

describe('chatSlice', () => {
  it('setConnected переключает флаг соединения', () => {
    const state = chatReducer(initial, setConnected(true));
    expect(state.connected).toBe(true);
  });

  it('setActiveConversation запоминает активный диалог', () => {
    const state = chatReducer(initial, setActiveConversation('c1'));
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
