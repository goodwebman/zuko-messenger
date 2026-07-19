import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Post } from '@zuko/contracts';
import { UserAvatar } from '@/entities/user';
import { timeAgo } from '@/shared/lib';
import { PostImages } from './post-images';

function QuotedPost({ post }: { post: Post }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="mt-3 block rounded-md border border-steel-border bg-ink-well p-3 transition-colors hover:border-graphite-hairline"
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="text-cloud-text">{post.author.displayName}</span>
        <span className="text-fog-text">@{post.author.username}</span>
      </div>
      <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-ash-text">{post.body}</p>
    </Link>
  );
}

interface PostCardProps {
  post: Post;
  /** Панель действий (лайк/коммент/репост/ссылка) — из features. */
  actions?: ReactNode;
  /** Слот в шапке (например, удаление своего поста). */
  headerSlot?: ReactNode;
}

/** Презентационная карточка поста. Интерактив внедряется через слоты (FSD: entity без features). */
export function PostCard({ post, actions, headerSlot }: PostCardProps) {
  return (
    <article className="border-b border-steel-border px-4 py-4">
      <div className="flex gap-3">
        <Link href={`/profile/${post.author.username}`}>
          <UserAvatar user={post.author} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/profile/${post.author.username}`}
              className="text-bone-text hover:underline"
            >
              {post.author.displayName}
            </Link>
            <span className="text-fog-text">@{post.author.username}</span>
            <span className="text-fog-text">·</span>
            <Link href={`/post/${post.id}`} className="text-fog-text hover:underline">
              {timeAgo(post.createdAt)}
            </Link>
            {headerSlot && <div className="ml-auto">{headerSlot}</div>}
          </div>

          {post.body && (
            <p className="mt-1.5 whitespace-pre-wrap wrap-break-word text-base text-cloud-text">
              {post.body}
            </p>
          )}
          {post.images.length > 0 && <PostImages images={post.images} />}
          {post.repostOf && <QuotedPost post={post.repostOf} />}

          {actions && <div className="mt-3">{actions}</div>}
        </div>
      </div>
    </article>
  );
}
