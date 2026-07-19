import type { ChatState } from './slice';

/**
 * Селекторы типизированы по срезу, а не по RootState — чтобы entity не импортил app-слой
 * (правило FSD: импорты только вниз). RootState структурно совместим с `ChatSlice`.
 */
type ChatSlice = { chat: ChatState };

/** Стабильная ссылка на «нет печатающих» — иначе селектор возвращал бы новый [] каждый рендер. */
const EMPTY_TYPING: readonly string[] = Object.freeze([]);

export const selectConnected = (state: ChatSlice) => state.chat.connected;
export const selectActiveConversation = (state: ChatSlice) => state.chat.activeConversationId;

export const selectPresence =
  (userId: string | undefined) =>
  (state: ChatSlice): boolean =>
    userId ? (state.chat.presence[userId] ?? false) : false;

export const selectTyping =
  (conversationId: string) =>
  (state: ChatSlice): readonly string[] =>
    state.chat.typing[conversationId] ?? EMPTY_TYPING;
