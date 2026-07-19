import { Prisma } from '@zuko/db';
import type { Post as PostDTO } from '@zuko/contracts';
import { toUserPublic } from '../../lib/serializers';

/** Include для поста: автор, агрегаты, лайк текущего юзера, оригинал (для репоста). */
export function postInclude(meId: string) {
  const likeAndCounts = {
    author: true,
    _count: { select: { likes: true, comments: true, reposts: true } },
    likes: { where: { userId: meId }, select: { id: true } },
  } satisfies Prisma.PostInclude;

  return {
    ...likeAndCounts,
    repostOf: { include: likeAndCounts },
  } satisfies Prisma.PostInclude;
}

type PostWithRelations = Prisma.PostGetPayload<{ include: ReturnType<typeof postInclude> }>;

export function toPost(post: PostWithRelations): PostDTO {
  const repostOf = post.repostOf
    ? {
        id: post.repostOf.id,
        body: post.repostOf.body,
        images: post.repostOf.images,
        author: toUserPublic(post.repostOf.author),
        createdAt: post.repostOf.createdAt.toISOString(),
        updatedAt: post.repostOf.updatedAt.toISOString(),
        likeCount: post.repostOf._count.likes,
        commentCount: post.repostOf._count.comments,
        repostCount: post.repostOf._count.reposts,
        likedByMe: post.repostOf.likes.length > 0,
        repostOf: null,
      }
    : null;

  return {
    id: post.id,
    body: post.body,
    images: post.images,
    author: toUserPublic(post.author),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    repostCount: post._count.reposts,
    likedByMe: post.likes.length > 0,
    repostOf,
  };
}
