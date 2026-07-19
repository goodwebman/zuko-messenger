import { z } from 'zod';
import { userPublicSchema } from './user';

export const createCommentSchema = z.object({
  body: z.string().min(1, 'Комментарий не может быть пустым').max(1000),
});

export const commentSchema = z.object({
  id: z.string(),
  postId: z.string(),
  body: z.string(),
  author: userPublicSchema,
  createdAt: z.string(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type Comment = z.infer<typeof commentSchema>;
