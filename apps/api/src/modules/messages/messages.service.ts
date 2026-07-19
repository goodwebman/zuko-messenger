import { prisma } from '@zuko/db';
import type { Conversation as ConversationDTO, Message as MessageDTO } from '@zuko/contracts';
import { toMessage, toUserPublic } from '../../lib/serializers';
import { forbidden, notFound } from '../../lib/errors';

/** Проверяет, что юзер — участник диалога. Возвращает id других участников. */
export async function assertParticipant(
  conversationId: string,
  userId: string,
): Promise<string[]> {
  const parts = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  if (parts.length === 0) throw notFound('Диалог не найден');
  if (!parts.some((p) => p.userId === userId)) throw forbidden('Нет доступа к диалогу');
  return parts.filter((p) => p.userId !== userId).map((p) => p.userId);
}

/** Находит существующий 1-на-1 диалог с userId или создаёт новый. */
export async function getOrCreateConversation(meId: string, otherId: string): Promise<string> {
  if (meId === otherId) throw forbidden('Нельзя начать диалог с собой');
  const other = await prisma.user.findUnique({ where: { id: otherId }, select: { id: true } });
  if (!other) throw notFound('Пользователь не найден');

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: meId } } },
        { participants: { some: { userId: otherId } } },
      ],
    },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.conversation.create({
    data: { participants: { create: [{ userId: meId }, { userId: otherId }] } },
    select: { id: true },
  });
  return created.id;
}

/** Пишет сообщение и возвращает DTO + id получателей (для уведомлений/эмита). */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<{ message: MessageDTO; recipientIds: string[] }> {
  const recipientIds = await assertParticipant(conversationId, senderId);
  const message = await prisma.message.create({
    data: { conversationId, senderId, body },
    include: { sender: true },
  });
  return { message: toMessage(message), recipientIds };
}

/** Помечает входящие сообщения диалога прочитанными. */
export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<Date> {
  const now = new Date();
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: now },
  });
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: now },
  });
  return now;
}

/** Сводка по диалогу для списка: собеседник, последнее сообщение, непрочитанные. */
export async function getConversationSummary(
  conversationId: string,
  meId: string,
): Promise<ConversationDTO> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: { include: { user: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: true } },
    },
  });
  if (!conversation) throw notFound('Диалог не найден');

  const me = conversation.participants.find((p) => p.userId === meId);
  const peerPart = conversation.participants.find((p) => p.userId !== meId);
  if (!peerPart) throw notFound('Собеседник не найден');

  const unreadCount = await prisma.message.count({
    where: {
      conversationId,
      senderId: { not: meId },
      ...(me?.lastReadAt ? { createdAt: { gt: me.lastReadAt } } : {}),
    },
  });

  const last = conversation.messages[0];
  return {
    id: conversation.id,
    peer: toUserPublic(peerPart.user),
    lastMessage: last ? toMessage(last) : null,
    unreadCount,
    updatedAt: (last?.createdAt ?? conversation.createdAt).toISOString(),
  };
}
