import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Эфемерное realtime-состояние транспорта. Непрочитанные (unread) — это server-state,
 * они живут в кэше conversations (TanStack Query), а не здесь: единый источник правды.
 */
export interface ChatState {
  connected: boolean;
  activeConversationId: string | null;
  /** userId'ы, печатающие в диалоге. */
  typing: Record<string, string[]>;
  /** онлайн-статусы по userId. */
  presence: Record<string, boolean>;
}

const initialState: ChatState = {
  connected: false,
  activeConversationId: null,
  typing: {},
  presence: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },
    setTyping(
      state,
      action: PayloadAction<{ conversationId: string; userId: string; typing: boolean }>,
    ) {
      const { conversationId, userId, typing } = action.payload;
      const current = state.typing[conversationId] ?? [];
      state.typing[conversationId] = typing
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
    },
    setPresence(state, action: PayloadAction<{ userId: string; online: boolean }>) {
      state.presence[action.payload.userId] = action.payload.online;
    },
  },
});

export const { setConnected, setActiveConversation, setTyping, setPresence } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
