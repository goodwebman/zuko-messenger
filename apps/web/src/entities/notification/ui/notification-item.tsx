import Link from 'next/link';
import type { Notification } from '@zuko/contracts';
import { cn } from '@zuko/ui';
import { UserAvatar } from '@/entities/user';
import { timeAgo } from '@/shared/lib';
import { notificationLabel, notificationTarget } from '../lib/notification-text';

export function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <Link
      href={notificationTarget(notification)}
      className={cn(
        'flex items-center gap-3 border-b border-steel-border px-4 py-3 transition-colors hover:bg-accent/50',
        !notification.read && 'bg-accent/30',
      )}
    >
      <UserAvatar user={notification.actor} />
      <p className="min-w-0 flex-1 text-base text-cloud-text">
        <span className="text-bone-text">{notification.actor.displayName}</span>{' '}
        {notificationLabel(notification)}
      </p>
      <span className="shrink-0 text-xs text-fog-text">{timeAgo(notification.createdAt)}</span>
      {!notification.read && <span className="size-2 shrink-0 rounded-full bg-signal-lime" />}
    </Link>
  );
}
