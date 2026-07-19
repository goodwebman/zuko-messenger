import type { FastifyInstance } from 'fastify';
import { prisma } from '@zuko/db';
import { loginSchema, registerSchema, type Me } from '@zuko/contracts';
import { hashPassword, verifyPassword } from '../../lib/password';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from '../../lib/cookies';
import { authenticate } from '../../lib/auth';
import { badRequest, conflict, unauthorized } from '../../lib/errors';

const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7d

interface UserRow {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}

const toMe = (u: UserRow): Me => ({
  id: u.id,
  username: u.username,
  email: u.email,
  displayName: u.displayName,
  avatarUrl: u.avatarUrl,
  bio: u.bio,
  createdAt: u.createdAt.toISOString(),
});

/** Создаёт access+refresh, сохраняет хэш refresh в БД. */
async function issueSession(userId: string) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
  return { accessToken, refreshToken };
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/auth/register', async (req, reply) => {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username: data.username }, { email: data.email }] },
      select: { username: true, email: true },
    });
    if (existing) {
      throw conflict(
        existing.username === data.username ? 'Username занят' : 'Email уже используется',
      );
    }

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        passwordHash: await hashPassword(data.password),
      },
    });

    const tokens = await issueSession(user.id);
    setAuthCookies(reply, tokens);
    return reply.code(201).send(toMe(user));
  });

  app.post('/auth/login', async (req, reply) => {
    const { login, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { OR: [{ username: login }, { email: login.toLowerCase() }] },
    });
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      throw unauthorized('Неверный логин или пароль');
    }

    const tokens = await issueSession(user.id);
    setAuthCookies(reply, tokens);
    return reply.send(toMe(user));
  });

  app.post('/auth/refresh', async (req, reply) => {
    const raw = req.cookies[REFRESH_COOKIE];
    if (!raw) throw unauthorized('Нет refresh-токена');

    let userId: string;
    try {
      userId = verifyRefreshToken(raw).sub;
    } catch {
      clearAuthCookies(reply);
      throw unauthorized('Refresh-токен недействителен');
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(raw) },
    });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      clearAuthCookies(reply);
      throw unauthorized('Сессия недействительна');
    }

    // Ротация: гасим старый refresh, выдаём новую пару.
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    const tokens = await issueSession(userId);
    setAuthCookies(reply, tokens);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw unauthorized('Пользователь не найден');
    return reply.send(toMe(user));
  });

  app.post('/auth/logout', async (req, reply) => {
    const raw = req.cookies[REFRESH_COOKIE];
    if (raw) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(raw) },
        data: { revoked: true },
      });
    }
    clearAuthCookies(reply);
    return reply.send({ ok: true });
  });

  app.get('/auth/me', { preHandler: authenticate }, async (req) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw badRequest('Пользователь не найден');
    return toMe(user);
  });
}
