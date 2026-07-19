import type { FastifyReply } from 'fastify';
import { env } from '../env';

export const ACCESS_COOKIE = 'zuko_at';
export const REFRESH_COOKIE = 'zuko_rt';

const isProd = env.NODE_ENV === 'production';

const base = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProd,
  path: '/',
};

const ACCESS_MAX_AGE = 60 * 15; // 15m
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7d

export function setAuthCookies(
  reply: FastifyReply,
  tokens: { accessToken: string; refreshToken: string },
): void {
  reply.setCookie(ACCESS_COOKIE, tokens.accessToken, { ...base, maxAge: ACCESS_MAX_AGE });
  reply.setCookie(REFRESH_COOKIE, tokens.refreshToken, { ...base, maxAge: REFRESH_MAX_AGE });
}

export function clearAuthCookies(reply: FastifyReply): void {
  reply.clearCookie(ACCESS_COOKIE, { ...base });
  reply.clearCookie(REFRESH_COOKIE, { ...base });
}
