import { z } from 'zod';

/** Публичное представление пользователя (без email/hash). */
export const userPublicSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  createdAt: z.string(),
});

/** Профиль текущего юзера (то, что видит он сам). */
export const meSchema = userPublicSchema.extend({
  email: z.string(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(280).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type UserPublic = z.infer<typeof userPublicSchema>;
export type Me = z.infer<typeof meSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
