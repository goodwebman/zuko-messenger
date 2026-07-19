import type { QueryClient } from '@tanstack/react-query';
import type { Paginated, Post } from '@zuko/contracts';
import { queryKeys } from '@/shared/config';

type PostUpdater = (post: Post) => Post;

/** Чистая функция: применяет обновление к посту во всех страницах ленты (и к репостам на него). */
export function updatePostInPages(
  pages: Paginated<Post>[],
  postId: string,
  fn: PostUpdater,
): Paginated<Post>[] {
  return pages.map((page) => ({
    ...page,
    items: page.items.map((item) => {
      if (item.id === postId) return fn(item);
      if (item.repostOf?.id === postId) return { ...item, repostOf: fn(item.repostOf) };
      return item;
    }),
  }));
}

interface InfiniteFeed {
  pages: Paginated<Post>[];
  pageParams: unknown[];
}

/** Точечно обновляет пост во всех кэшах ленты и в кэше детали поста. */
export function patchPost(qc: QueryClient, postId: string, fn: PostUpdater): void {
  qc.setQueriesData<InfiniteFeed>({ queryKey: ['feed'] }, (data) =>
    data ? { ...data, pages: updatePostInPages(data.pages, postId, fn) } : data,
  );
  qc.setQueryData<Post>(queryKeys.post(postId), (post) => (post ? fn(post) : post));
}
