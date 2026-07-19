import type {
  Comment as CommentDTO,
  Message as MessageDTO,
  Notification as NotificationDTO,
  UserPublic,
} from '@zuko/contracts';

interface UserRow {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}

export const toUserPublic = (u: UserRow): UserPublic => ({
  id: u.id,
  username: u.username,
  displayName: u.displayName,
  avatarUrl: u.avatarUrl,
  bio: u.bio,
  createdAt: u.createdAt.toISOString(),
});

export const toComment = (c: {
  id: string;
  postId: string;
  body: string;
  createdAt: Date;
  author: UserRow;
}): CommentDTO => ({
  id: c.id,
  postId: c.postId,
  body: c.body,
  createdAt: c.createdAt.toISOString(),
  author: toUserPublic(c.author),
});

export const toMessage = (m: {
  id: string;
  conversationId: string;
  body: string;
  createdAt: Date;
  readAt: Date | null;
  sender: UserRow;
}): MessageDTO => ({
  id: m.id,
  conversationId: m.conversationId,
  body: m.body,
  createdAt: m.createdAt.toISOString(),
  readAt: m.readAt ? m.readAt.toISOString() : null,
  sender: toUserPublic(m.sender),
});

export const toNotification = (n: {
  id: string;
  type: NotificationDTO['type'];
  postId: string | null;
  messageId: string | null;
  conversationId: string | null;
  read: boolean;
  createdAt: Date;
  actor: UserRow;
}): NotificationDTO => ({
  id: n.id,
  type: n.type,
  postId: n.postId,
  messageId: n.messageId,
  conversationId: n.conversationId,
  read: n.read,
  createdAt: n.createdAt.toISOString(),
  actor: toUserPublic(n.actor),
});
