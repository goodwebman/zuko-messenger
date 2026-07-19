import type { FastifyReply, FastifyRequest } from 'fastify';
import { unauthorized } from './errors';
import { verifyAccessToken } from './jwt';
import { ACCESS_COOKIE } from './cookies';

declare module 'fastify' {
  interface FastifyRequest {
    /** Гарантированно заполнен после `authenticate`. */
    userId: string;
    /**
     * Заполнен после `optionalAuthenticate`, у гостя — `undefined`.
     * Отдельное поле, чтобы `userId` в защищённых роутах оставался честным `string`.
     */
    viewerId?: string;
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
    req.viewerId = payload.sub;
  } catch {
    throw unauthorized('Сессия истекла');
  }
}

/**
 * preHandler для публичного контента: гость читает ленту и посты без токена,
 * а залогиненный получает `viewerId` — по нему считается `likedByMe`.
 * Никогда не бросает 401: протухший токен здесь равнозначен его отсутствию.
 */
export async function optionalAuthenticate(req: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const token = extractToken(req);
  if (!token) return;
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.viewerId = payload.sub;
  } catch {
    // Читает как аноним — фронт сам сходит за refresh, когда понадобится.
  }
}
