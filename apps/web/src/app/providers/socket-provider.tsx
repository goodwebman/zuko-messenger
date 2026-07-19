'use client';

import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@zuko/ui';
import type { Message, Notification } from '@zuko/contracts';
import { disconnectSocket, getSocket } from '@/shared/socket';
import { queryKeys } from '@/shared/config';
import { useAppDispatch, useAppSelector } from '@/shared/lib';
import { selectCurrentUser } from '@/entities/session';
import { incrementUnread, setConnected, setPresence, setTyping } from '@/entities/conversation';
import { notificationToast } from '@/entities/notification';

/**
 * Владеет жизненным циклом сокета: подключается после появления сессии,
 * маршрутизирует realtime-события в TanStack Query (данные) и стор (UI-состояние).
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const userId = useAppSelector(selectCurrentUser)?.id;
  const dispatch = useAppDispatch();
  const qc = useQueryClient();
  const { addToast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();
    socket.connect();

    const onConnect = () => dispatch(setConnected(true));
    const onDisconnect = () => dispatch(setConnected(false));

    const onMessageNew = (message: Message) => {
      void qc.invalidateQueries({ queryKey: queryKeys.messages(message.conversationId) });
      void qc.invalidateQueries({ queryKey: queryKeys.conversations });
    };

    const onNotificationNew = (n: Notification) => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications });
      if (n.type === 'MESSAGE' && n.conversationId) dispatch(incrementUnread(n.conversationId));
      addToast(notificationToast(n), n.type === 'MESSAGE' ? 'info' : 'default');
    };

    const onTyping = (p: { conversationId: string; userId: string; typing: boolean }) =>
      dispatch(setTyping(p));
    const onPresence = (p: { userId: string; online: boolean }) => dispatch(setPresence(p));
    const onMessageRead = (p: { conversationId: string }) =>
      void qc.invalidateQueries({ queryKey: queryKeys.messages(p.conversationId) });

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message:new', onMessageNew);
    socket.on('notification:new', onNotificationNew);
    socket.on('typing', onTyping);
    socket.on('presence:update', onPresence);
    socket.on('message:read', onMessageRead);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message:new', onMessageNew);
      socket.off('notification:new', onNotificationNew);
      socket.off('typing', onTyping);
      socket.off('presence:update', onPresence);
      socket.off('message:read', onMessageRead);
      disconnectSocket();
      dispatch(setConnected(false));
    };
  }, [userId, dispatch, qc, addToast]);

  return <>{children}</>;
}
