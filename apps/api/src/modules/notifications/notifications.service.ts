import { prisma, type NotificationType } from '@zuko/db';
import { toNotification } from '../../lib/serializers';
import { emitToUser } from '../../realtime/registry';

interface CreateNotificationInput {
  userId: string; // получатель
  actorId: string; // инициатор
  type: NotificationType;
  postId?: string;
  messageId?: string;
  conversationId?: string;
}

/**
 * Создаёт уведомление и пушит его получателю в реальном времени.
 * Себе уведомления не шлём.
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  if (input.userId === input.actorId) return;

  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      actorId: input.actorId,
      type: input.type,
      postId: input.postId,
      messageId: input.messageId,
      conversationId: input.conversationId,
    },
    include: { actor: true },
  });

  emitToUser(input.userId, 'notification:new', toNotification(notification));
}
