import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Post } from '@zuko/contracts';
import { cn } from '@zuko/ui';
import { UserAvatar } from '@/entities/user';
import { timeAgo } from '@/shared/lib';

/** Сетка вложенных фото: 1 — во всю ширину, 3 — первое широкое, 2/4 — плитка. */
function PostImages({ images }: { images: string[] }) {
  const items = images.slice(0, 4);
  const oddLead = items.length % 2 === 1; // 1 или 3 → первое фото на всю ширину
  return (
    <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-2xl border border-steel-border">
      {items.map((src, i) => {
        const wide = oddLead && i === 0;
        return (
          <a
            key={src}
            href={src}
            target="_blank"
            rel="noreferrer"
            className={cn(
              'relative block overflow-hidden bg-ink-well',
              wide ? 'col-span-2 aspect-video' : 'aspect-square',
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 hover:scale-[1.03]"
            />
          </a>
        );
      })}
    </div>
  );
}

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
            <p className="mt-1 whitespace-pre-wrap break-words text-[15px] text-cloud-text">
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
