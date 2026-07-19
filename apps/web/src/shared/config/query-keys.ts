export const queryKeys = {
  me: ['me'] as const,
  feed: (authorId?: string) => ['feed', authorId ?? 'all'] as const,
  post: (id: string) => ['post', id] as const,
  comments: (postId: string) => ['comments', postId] as const,
  conversations: ['conversations'] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  notifications: ['notifications'] as const,
  user: (username: string) => ['user', username] as const,
} as const;
