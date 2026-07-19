import type { RootState } from '@/app/store';

export const selectConnected = (state: RootState) => state.chat.connected;
export const selectActiveConversation = (state: RootState) => state.chat.activeConversationId;

export const selectTotalUnread = (state: RootState): number =>
  Object.values(state.chat.unread).reduce((sum, n) => sum + n, 0);

export const selectUnread = (conversationId: string) => (state: RootState): number =>
  state.chat.unread[conversationId] ?? 0;

export const selectPresence = (userId: string | undefined) => (state: RootState): boolean =>
  userId ? (state.chat.presence[userId] ?? false) : false;

export const selectTyping = (conversationId: string) => (state: RootState): string[] =>
  state.chat.typing[conversationId] ?? [];
