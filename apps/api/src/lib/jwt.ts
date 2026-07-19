import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../env';

export interface AccessPayload {
  sub: string; // userId
}

export const signAccessToken = (userId: string): string =>
  jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL as SignOptions['expiresIn'],
  });

export const signRefreshToken = (userId: string): string =>
  jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL as SignOptions['expiresIn'],
  });

function extractSub(decoded: string | jwt.JwtPayload): AccessPayload {
  if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
    throw new Error('Некорректный payload токена');
  }
  return { sub: decoded.sub };
}

export const verifyAccessToken = (token: string): AccessPayload =>
  extractSub(jwt.verify(token, env.JWT_ACCESS_SECRET));

export const verifyRefreshToken = (token: string): AccessPayload =>
  extractSub(jwt.verify(token, env.JWT_REFRESH_SECRET));

/** Хэш refresh-токена для хранения в БД (не храним сырой токен). */
export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');
