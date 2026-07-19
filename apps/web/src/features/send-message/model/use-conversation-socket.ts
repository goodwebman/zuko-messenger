import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@zuko/ui';
import { getSocket } from '@/shared/socket';
import { useAppDispatch, useAppSelector } from '@/shared/lib';
import {
  clearConversationUnread,
  selectConnected,
  setActiveConversation,
} from '@/entities/conversation';

export interface ConversationSocketApi {
  send: (body: string) => void;
  markRead: () => void;
  startTyping: () => void;
  stopTyping: () => void;
}

/**
 * Управляет сокет-жизненным циклом активного диалога: join/leave комнаты, отметка прочтения
 * при входе, действия отправки/typing. Входящие данные — через SocketProvider (app-слой).
 */
export function useConversationSocket(conversationId: string): ConversationSocketApi {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  const { addToast } = useToast();
  const connected = useAppSelector(selectConnected);

  // Жизненный цикл диалога: пометка активного + мгновенное гашение бейджа, leave на выходе.
  useEffect(() => {
    dispatch(setActiveConversation(conversationId));
    clearConversationUnread(qc, conversationId);

    return () => {
      getSocket().emit('conversation:leave', conversationId);
      dispatch(setActiveConversation(null));
    };
  }, [conversationId, dispatch, qc]);

  // join/read гейтим по connected: комнаты на сервере сбрасываются при разрыве,
  // поэтому переподключаемся к комнате при каждом восстановлении соединения.
  useEffect(() => {
    if (!connected) return;
    const socket = getSocket();
    socket.emit('conversation:join', conversationId);
    socket.emit('message:read', conversationId);
  }, [connected, conversationId]);

  // Стабильная ссылка на API — чтобы эффекты-потребители (markRead в чате) не перезапускались.
  return useMemo<ConversationSocketApi>(
    () => ({
      // Сообщение прилетит обратно эхом message:new (мы в комнате) → попадёт в кэш там.
      // ack ловим только чтобы не терять ошибки отправки молча.
      send: (body) =>
        getSocket().emit('message:send', { conversationId, body }, (res) => {
          if (!res.ok) addToast(res.error, 'error');
        }),
      markRead: () => getSocket().emit('message:read', conversationId),
      startTyping: () => getSocket().emit('typing:start', conversationId),
      stopTyping: () => getSocket().emit('typing:stop', conversationId),
    }),
    [conversationId, addToast],
  );
}
