import type { FastifyInstance } from 'fastify';
import { prisma } from '@zuko/db';
import { updateProfileSchema } from '@zuko/contracts';
import { authenticate } from '../../lib/auth';
import { toUserPublic } from '../../lib/serializers';
import { notFound } from '../../lib/errors';

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.get('/users/:username', async (req) => {
    const { username } = req.params as { username: string };
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw notFound('Пользователь не найден');
    return toUserPublic(user);
  });

  app.patch('/users/me', { preHandler: authenticate }, async (req) => {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
    });
    return toUserPublic(user);
  });
}
