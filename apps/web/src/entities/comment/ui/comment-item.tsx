import Link from 'next/link';
import type { Comment } from '@zuko/contracts';
import { UserAvatar } from '@/entities/user';
import { timeAgo } from '@/shared/lib';

export function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3 border-b border-steel-border px-4 py-3">
      <Link href={`/profile/${comment.author.username}`}>
        <UserAvatar user={comment.author} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-bone-text">{comment.author.displayName}</span>
          <span className="text-fog-text">@{comment.author.username}</span>
          <span className="text-fog-text">·</span>
          <span className="text-fog-text">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-base text-cloud-text">{comment.body}</p>
      </div>
    </div>
  );
}
