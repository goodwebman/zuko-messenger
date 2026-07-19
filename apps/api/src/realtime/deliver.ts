import type { Message as MessageDTO } from '@zuko/contracts';
import { sendMessage } from '../modules/messages/messages.service';
import { createNotification } from '../modules/notifications/notifications.service';
import { getIO } from './registry';

export const conversationRoom = (conversationId: string): string =>
  `conversation:${conversationId}`;

/**
 * Единая точка доставки сообщения (socket + REST-фолбэк):
 * 1) пишет в БД, 2) эмитит message:new в комнату диалога,
 * 3) шлёт уведомление каждому получателю (createNotification сам эмитит notification:new).
 */
export async function deliverMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<MessageDTO> {
  const { message, recipientIds } = await sendMessage(conversationId, senderId, body);

  getIO().to(conversationRoom(conversationId)).emit('message:new', message);

  await Promise.all(
    recipientIds.map((userId) =>
      createNotification({
        userId,
        actorId: senderId,
        type: 'MESSAGE',
        conversationId,
        messageId: message.id,
      }),
    ),
  );

  return message;
}
