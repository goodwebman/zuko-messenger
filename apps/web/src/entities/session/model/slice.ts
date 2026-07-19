import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Me } from '@zuko/contracts';

export interface SessionState {
  user: Me | null;
  /** false до первой проверки /auth/me. */
  initialized: boolean;
}

const initialState: SessionState = { user: null, initialized: false };

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Me | null>) {
      state.user = action.payload;
      state.initialized = true;
    },
    clearUser(state) {
      state.user = null;
      state.initialized = true;
    },
  },
});

export const { setUser, clearUser } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
