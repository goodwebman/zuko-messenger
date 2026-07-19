import type { Notification } from '@zuko/contracts';

/** Текст уведомления в списке (без имени актора). */
export function notificationLabel(n: Notification): string {
  switch (n.type) {
    case 'MESSAGE':
      return 'написал вам сообщение';
    case 'LIKE':
      return 'лайкнул ваш пост';
    case 'COMMENT':
      return 'прокомментировал ваш пост';
    case 'REPOST':
      return 'сделал репост';
  }
}

/** Текст всплывающего toast (с именем актора). */
export function notificationToast(n: Notification): string {
  if (n.type === 'MESSAGE') return `${n.actor.displayName}: новое сообщение`;
  return `${n.actor.displayName} ${notificationLabel(n)}`;
}

/** Куда ведёт уведомление. */
export function notificationTarget(n: Notification): string {
  if (n.type === 'MESSAGE' && n.conversationId) return `/messages/${n.conversationId}`;
  if (n.postId) return `/post/${n.postId}`;
  return '/notifications';
}
