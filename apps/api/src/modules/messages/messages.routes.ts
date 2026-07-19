import type { FastifyInstance } from 'fastify';
import { prisma } from '@zuko/db';
import {
  createConversationSchema,
  messagesQuerySchema,
  sendMessageSchema,
  type Conversation as ConversationDTO,
  type Message as MessageDTO,
  type Paginated,
} from '@zuko/contracts';
import { authenticate } from '../../lib/auth';
import { toMessage } from '../../lib/serializers';
import { deliverMessage } from '../../realtime/deliver';
import {
  assertParticipant,
  getConversationSummary,
  getOrCreateConversation,
} from './messages.service';

export async function messagesRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  // Список диалогов текущего юзера (сортировка по последнему сообщению).
  app.get('/conversations', async (req): Promise<ConversationDTO[]> => {
    const parts = await prisma.conversationParticipant.findMany({
      where: { userId: req.userId },
      select: { conversationId: true },
    });
    const summaries = await Promise.all(
      parts.map((p) => getConversationSummary(p.conversationId, req.userId)),
    );
    return summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  });

  // Получить/создать диалог с пользователем.
  app.post('/conversations', async (req, reply) => {
    const { userId } = createConversationSchema.parse(req.body);
    const conversationId = await getOrCreateConversation(req.userId, userId);
    const summary = await getConversationSummary(conversationId, req.userId);
    return reply.code(201).send(summary);
  });

  // История сообщений (курсорная пагинация, свежие → старые).
  app.get('/conversations/:id/messages', async (req): Promise<Paginated<MessageDTO>> => {
    const { id } = req.params as { id: string };
    await assertParticipant(id, req.userId);
    const { cursor, limit } = messagesQuerySchema.parse(req.query);

    const rows = await prisma.message.findMany({
      where: { conversationId: id },
      include: { sender: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: items.map(toMessage),
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    };
  });

  // REST-фолбэк для отправки (основной путь — Socket.io).
  app.post('/conversations/:id/messages', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { body } = sendMessageSchema.parse(req.body);
    const message = await deliverMessage(id, req.userId, body);
    return reply.code(201).send(message);
  });
}
