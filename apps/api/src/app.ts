import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import Fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import { ZodError } from 'zod';
import { MAX_POST_IMAGES } from '@zuko/contracts';
import { env } from './env';
import { HttpError } from './lib/errors';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { postsRoutes } from './modules/posts/posts.routes';
import { commentsRoutes } from './modules/comments/comments.routes';
import { messagesRoutes } from './modules/messages/messages.routes';
import { notificationsRoutes } from './modules/notifications/notifications.routes';
import { uploadsRoutes } from './modules/uploads/uploads.routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
          : undefined,
    },
  });

  await app.register(cors, { origin: env.WEB_ORIGIN, credentials: true });
  await app.register(cookie);
  await app.register(rateLimit, { max: 300, timeWindow: '1 minute' });
  await app.register(multipart, {
    limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: MAX_POST_IMAGES },
  });

  // Директория загрузок + раздача файлов по /uploads/.
  const uploadDir = resolve(env.UPLOAD_DIR);
  mkdirSync(uploadDir, { recursive: true });
  await app.register(fastifyStatic, { root: uploadDir, prefix: '/uploads/' });

  // Единый обработчик ошибок: HttpError / ZodError / 500.
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({
        error: 'ValidationError',
        issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    if (err instanceof HttpError) {
      return reply.code(err.statusCode).send({ error: err.message });
    }
    if ((err as { statusCode?: number }).statusCode === 429) {
      return reply.code(429).send({ error: 'Слишком много запросов' });
    }
    if ((err as { statusCode?: number }).statusCode === 413) {
      return reply.code(413).send({ error: `Файл больше ${env.MAX_UPLOAD_MB} МБ` });
    }
    app.log.error(err);
    return reply.code(500).send({ error: 'Внутренняя ошибка сервера' });
  });

  app.get('/health', async () => ({ ok: true }));

  // Все API-роуты под /api.
  await app.register(
    async (api) => {
      await api.register(authRoutes);
      await api.register(usersRoutes);
      await api.register(postsRoutes);
      await api.register(uploadsRoutes);
      await api.register(commentsRoutes);
      await api.register(messagesRoutes);
      await api.register(notificationsRoutes);
    },
    { prefix: '/api' },
  );

  return app;
}
