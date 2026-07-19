import type { FastifyReply, FastifyRequest } from 'fastify';
import { unauthorized } from './errors';
import { verifyAccessToken } from './jwt';
import { ACCESS_COOKIE } from './cookies';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}

/** Достаёт access-токен из httpOnly cookie или Authorization: Bearer. */
function extractToken(req: FastifyRequest): string | null {
  const cookie = req.cookies[ACCESS_COOKIE];
  if (cookie) return cookie;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/** preHandler: требует валидный access-токен, кладёт userId в request. */
export async function authenticate(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const token = extractToken(req);
  if (!token) throw unauthorized('Не авторизован');
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
  } catch {
    throw unauthorized('Сессия истекла');
  }
}
