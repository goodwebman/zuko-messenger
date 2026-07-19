import { z } from 'zod';

// Валидация публичных env на границе: кривой URL — падаем на старте, а не молча ломаемся в рантайме.
const envSchema = z.object({
  API_URL: z.string().url(),
  SOCKET_URL: z.string().url(),
});

export const env = envSchema.parse({
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000',
});
