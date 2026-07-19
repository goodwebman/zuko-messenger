import { z } from 'zod';
import { userPublicSchema } from './user';

export const sendMessageSchema = z.object({
  body: z.string().min(1, 'Пустое сообщение').max(4000),
});

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  body: z.string(),
  sender: userPublicSchema,
  createdAt: z.string(),
  readAt: z.string().nullable(),
});

/** Диалог в списке: собеседник, последнее сообщение, кол-во непрочитанных. */
export const conversationSchema = z.object({
  id: z.string(),
  peer: userPublicSchema,
  lastMessage: messageSchema.nullable(),
  unreadCount: z.number(),
  updatedAt: z.string(),
});

/** Создать/получить диалог с юзером. */
export const createConversationSchema = z.object({
  userId: z.string(),
});

export const messagesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type MessagesQuery = z.infer<typeof messagesQuerySchema>;
