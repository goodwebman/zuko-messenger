import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ChatState {
  connected: boolean;
  activeConversationId: string | null;
  /** userId'ы, печатающие в диалоге. */
  typing: Record<string, string[]>;
  /** непрочитанные по диалогам. */
  unread: Record<string, number>;
  /** онлайн-статусы по userId. */
  presence: Record<string, boolean>;
}

const initialState: ChatState = {
  connected: false,
  activeConversationId: null,
  typing: {},
  unread: {},
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
      if (action.payload) state.unread[action.payload] = 0;
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
    incrementUnread(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (id === state.activeConversationId) return;
      state.unread[id] = (state.unread[id] ?? 0) + 1;
    },
    clearUnread(state, action: PayloadAction<string>) {
      state.unread[action.payload] = 0;
    },
    setUnreadMap(state, action: PayloadAction<Record<string, number>>) {
      state.unread = action.payload;
    },
    setPresence(state, action: PayloadAction<{ userId: string; online: boolean }>) {
      state.presence[action.payload.userId] = action.payload.online;
    },
  },
});

export const {
  setConnected,
  setActiveConversation,
  setTyping,
  incrementUnread,
  clearUnread,
  setUnreadMap,
  setPresence,
} = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
