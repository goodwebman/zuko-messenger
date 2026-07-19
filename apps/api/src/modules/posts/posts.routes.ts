import type { FastifyInstance } from 'fastify';
import { prisma } from '@zuko/db';
import {
  createPostSchema,
  feedQuerySchema,
  repostSchema,
  updatePostSchema,
  type Paginated,
  type Post as PostDTO,
} from '@zuko/contracts';
import { authenticate } from '../../lib/auth';
import { forbidden, notFound } from '../../lib/errors';
import { createNotification } from '../notifications/notifications.service';
import { postInclude, toPost } from './posts.service';

export async function postsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);

  // Лента (курсорная пагинация). authorId → посты конкретного юзера (профиль).
  app.get('/posts', async (req): Promise<Paginated<PostDTO>> => {
    const { cursor, limit, authorId } = feedQuerySchema.parse(req.query);

    const rows = await prisma.post.findMany({
      where: authorId ? { authorId } : undefined,
      include: postInclude(req.userId),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    return {
      items: items.map(toPost),
      nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
    };
  });

  app.get('/posts/:id', async (req): Promise<PostDTO> => {
    const { id } = req.params as { id: string };
    const post = await prisma.post.findUnique({ where: { id }, include: postInclude(req.userId) });
    if (!post) throw notFound('Пост не найден');
    return toPost(post);
  });

  app.post('/posts', async (req, reply) => {
    const { body, images } = createPostSchema.parse(req.body);
    const post = await prisma.post.create({
      data: { authorId: req.userId, body, images },
      include: postInclude(req.userId),
    });
    return reply.code(201).send(toPost(post));
  });

  app.patch('/posts/:id', async (req) => {
    const { id } = req.params as { id: string };
    const { body } = updatePostSchema.parse(req.body);
    const existing = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!existing) throw notFound('Пост не найден');
    if (existing.authorId !== req.userId) throw forbidden('Это не ваш пост');

    const post = await prisma.post.update({
      where: { id },
      data: { body },
      include: postInclude(req.userId),
    });
    return toPost(post);
  });

  app.delete('/posts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const existing = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!existing) throw notFound('Пост не найден');
    if (existing.authorId !== req.userId) throw forbidden('Это не ваш пост');
    await prisma.post.delete({ where: { id } });
    return reply.code(204).send();
  });

  // ── Likes ──────────────────────────────────────────────────────────────────
  app.post('/posts/:id/like', async (req) => {
    const { id } = req.params as { id: string };
    const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!post) throw notFound('Пост не найден');

    await prisma.like.upsert({
      where: { postId_userId: { postId: id, userId: req.userId } },
      create: { postId: id, userId: req.userId },
      update: {},
    });
    await createNotification({
      userId: post.authorId,
      actorId: req.userId,
      type: 'LIKE',
      postId: id,
    });

    const likeCount = await prisma.like.count({ where: { postId: id } });
    return { postId: id, likedByMe: true, likeCount };
  });

  app.delete('/posts/:id/like', async (req) => {
    const { id } = req.params as { id: string };
    await prisma.like
      .delete({ where: { postId_userId: { postId: id, userId: req.userId } } })
      .catch(() => undefined);
    const likeCount = await prisma.like.count({ where: { postId: id } });
    return { postId: id, likedByMe: false, likeCount };
  });

  // ── Repost ───────────────────────────────────────────────────────────────
  app.post('/posts/:id/repost', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { body } = repostSchema.parse(req.body ?? {});
    const original = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!original) throw notFound('Пост не найден');

    const post = await prisma.post.create({
      data: { authorId: req.userId, body, repostOfId: id },
      include: postInclude(req.userId),
    });
    await createNotification({
      userId: original.authorId,
      actorId: req.userId,
      type: 'REPOST',
      postId: id,
    });
    return reply.code(201).send(toPost(post));
  });
}
