import { describe, expect, it } from 'vitest';
import type { Me } from '@zuko/contracts';
import { clearUser, sessionReducer, setUser } from './slice';

const me: Me = {
  id: 'u1',
  username: 'alice',
  email: 'alice@zuko.dev',
  displayName: 'Alice',
  avatarUrl: null,
  bio: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('sessionSlice', () => {
  it('setUser кладёт юзера и помечает initialized', () => {
    const state = sessionReducer(undefined, setUser(me));
    expect(state.user).toEqual(me);
    expect(state.initialized).toBe(true);
  });

  it('clearUser сбрасывает юзера, но оставляет initialized', () => {
    const withUser = sessionReducer(undefined, setUser(me));
    const state = sessionReducer(withUser, clearUser());
    expect(state.user).toBeNull();
    expect(state.initialized).toBe(true);
  });
});
