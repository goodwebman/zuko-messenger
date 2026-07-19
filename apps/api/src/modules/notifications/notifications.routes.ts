import type { FastifyInstance } from 'fastify';
import { prisma } from '@zuko/db';
import type { Notification as NotificationDTO } from '@zuko/contracts';
import { authenticate } from '../../lib/auth';
import { toNotification } from '../../lib/serializers';

export async function notificationsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.get('/notifications', async (req): Promise<{ items: NotificationDTO[]; unread: number }> => {
    const [rows, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.userId },
        include: { actor: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({ where: { userId: req.userId, read: false } }),
    ]);
    return { items: rows.map(toNotification), unread };
  });

  app.post('/notifications/:id/read', async (req) => {
    const { id } = req.params as { id: string };
    await prisma.notification.updateMany({
      where: { id, userId: req.userId },
      data: { read: true },
    });
    return { ok: true };
  });

  app.post('/notifications/read-all', async (req) => {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true },
    });
    return { ok: true };
  });
}
