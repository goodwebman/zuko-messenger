import type { FastifyInstance } from 'fastify';
import { prisma } from '@zuko/db';
import { createCommentSchema, type Comment as CommentDTO } from '@zuko/contracts';
import { authenticate } from '../../lib/auth';
import { forbidden, notFound } from '../../lib/errors';
import { toComment } from '../../lib/serializers';
import { createNotification } from '../notifications/notifications.service';

export async function commentsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  app.get('/posts/:id/comments', async (req): Promise<CommentDTO[]> => {
    const { id } = req.params as { id: string };
    const comments = await prisma.comment.findMany({
      where: { postId: id },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
    return comments.map(toComment);
  });

  app.post('/posts/:id/comments', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { body } = createCommentSchema.parse(req.body);
    const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!post) throw notFound('Пост не найден');

    const comment = await prisma.comment.create({
      data: { postId: id, authorId: req.userId, body },
      include: { author: true },
    });
    await createNotification({
      userId: post.authorId,
      actorId: req.userId,
      type: 'COMMENT',
      postId: id,
    });
    return reply.code(201).send(toComment(comment));
  });

  app.delete('/comments/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const comment = await prisma.comment.findUnique({ where: { id }, select: { authorId: true } });
    if (!comment) throw notFound('Комментарий не найден');
    if (comment.authorId !== req.userId) throw forbidden('Это не ваш комментарий');
    await prisma.comment.delete({ where: { id } });
    return reply.code(204).send();
  });
}
