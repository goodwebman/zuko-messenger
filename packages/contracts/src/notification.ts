import { z } from 'zod';
import { userPublicSchema } from './user';

export const notificationTypeSchema = z.enum(['MESSAGE', 'LIKE', 'COMMENT', 'REPOST']);

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  actor: userPublicSchema,
  postId: z.string().nullable(),
  messageId: z.string().nullable(),
  conversationId: z.string().nullable(),
  read: z.boolean(),
  createdAt: z.string(),
});

export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type Notification = z.infer<typeof notificationSchema>;
