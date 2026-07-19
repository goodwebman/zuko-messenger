'use client';

import Link from 'next/link';
import type { Post } from '@zuko/contracts';
import { PostCard } from '@/entities/post';
import { selectCurrentUser } from '@/entities/session';
import { LikeButton } from '@/features/post-like';
import { RepostButton } from '@/features/post-repost';
import { DeletePostButton } from '@/features/post-delete';
import { CopyLinkButton } from '@/features/post-share';
import { useAppSelector } from '@/shared/lib';

function CommentLink({ post }: { post: Post }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-fog-text transition-colors hover:bg-accent"
      aria-label="Комментарии"
    >
      <span aria-hidden>💬</span>
      {post.commentCount > 0 && post.commentCount}
    </Link>
  );
}

/** Карточка поста с интерактивом — композиция entity PostCard и features. */
export function PostCardConnected({ post }: { post: Post }) {
  const me = useAppSelector(selectCurrentUser);
  const isOwn = me?.id === post.author.id;

  return (
    <PostCard
      post={post}
      headerSlot={isOwn ? <DeletePostButton postId={post.id} /> : undefined}
      actions={
        <div className="flex items-center gap-1 text-sm text-fog-text">
          <LikeButton post={post} />
          <CommentLink post={post} />
          <RepostButton post={post} />
          <CopyLinkButton postId={post.id} />
        </div>
      }
    />
  );
}
