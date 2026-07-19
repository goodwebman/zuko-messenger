import { useEffect } from 'react';
import { getSocket } from '@/shared/socket';
import { useAppDispatch } from '@/shared/lib';
import { setActiveConversation } from '@/entities/conversation';

export interface ConversationSocketApi {
  send: (body: string) => void;
  markRead: () => void;
  startTyping: () => void;
  stopTyping: () => void;
}

/**
 * Управляет сокет-жизненным циклом активного диалога: join/leave комнаты,
 * отметка прочтения при входе, действия отправки/typing. Входящие данные —
 * через SocketProvider (app-слой).
 */
export function useConversationSocket(conversationId: string): ConversationSocketApi {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = getSocket();
    socket.emit('conversation:join', conversationId);
    socket.emit('message:read', conversationId);
    dispatch(setActiveConversation(conversationId));

    return () => {
      socket.emit('conversation:leave', conversationId);
      dispatch(setActiveConversation(null));
    };
  }, [conversationId, dispatch]);

  return {
    send: (body) => getSocket().emit('message:send', { conversationId, body }),
    markRead: () => getSocket().emit('message:read', conversationId),
    startTyping: () => getSocket().emit('typing:start', conversationId),
    stopTyping: () => getSocket().emit('typing:stop', conversationId),
  };
}
