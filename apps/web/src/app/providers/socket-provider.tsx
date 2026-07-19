'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@zuko/ui';
import { disconnectSocket, getSocket } from '@/shared/socket';
import { useAppDispatch, useAppSelector } from '@/shared/lib';
import { selectCurrentUser } from '@/entities/session';
import { selectActiveConversation, setConnected } from '@/entities/conversation';
import { createRealtimeHandlers } from './create-realtime-handlers';

/**
 * Владеет жизненным циклом сокета: подключается после появления сессии, биндит/отвязывает
 * слушатели. Вся маршрутизация событий — в createRealtimeHandlers (тестируется отдельно).
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const userId = useAppSelector(selectCurrentUser)?.id;
  const activeConversationId = useAppSelector(selectActiveConversation);
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  const { addToast } = useToast();

  // Активный диалог читаем через ref — чтобы не пересоздавать слушатели при каждом открытии чата.
  const activeRef = useRef(activeConversationId);
  activeRef.current = activeConversationId;

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();
    socket.connect();

    const h = createRealtimeHandlers({
      qc,
      dispatch,
      toast: addToast,
      currentUserId: userId,
      getActiveConversationId: () => activeRef.current,
    });

    socket.on('connect', h.onConnect);
    socket.on('disconnect', h.onDisconnect);
    socket.on('message:new', h.onMessageNew);
    socket.on('notification:new', h.onNotificationNew);
    socket.on('typing', h.onTyping);
    socket.on('presence:update', h.onPresence);
    socket.on('message:read', h.onMessageRead);

    return () => {
      socket.off('connect', h.onConnect);
      socket.off('disconnect', h.onDisconnect);
      socket.off('message:new', h.onMessageNew);
      socket.off('notification:new', h.onNotificationNew);
      socket.off('typing', h.onTyping);
      socket.off('presence:update', h.onPresence);
      socket.off('message:read', h.onMessageRead);
      disconnectSocket();
      dispatch(setConnected(false));
    };
  }, [userId, dispatch, qc, addToast]);

  return <>{children}</>;
}
