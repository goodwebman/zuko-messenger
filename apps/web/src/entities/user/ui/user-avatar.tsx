import { UIAvatar, cn } from '@zuko/ui';
import type { UserPublic } from '@zuko/contracts';
import { initials } from '@/shared/lib';

interface UserAvatarProps {
  user: Pick<UserPublic, 'displayName' | 'avatarUrl'>;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <UIAvatar className={cn('size-11', className)}>
      {user.avatarUrl && <UIAvatar.Image src={user.avatarUrl} alt={user.displayName} />}
      <UIAvatar.Fallback>{initials(user.displayName)}</UIAvatar.Fallback>
    </UIAvatar>
  );
}
