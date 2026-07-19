'use client';

import { UIButton } from '@zuko/ui';
import { useFeed } from '@/entities/post';
import { PostCardConnected } from '@/widgets/post-card';
import { EmptyState } from '@/shared/ui';

export function Feed({ authorId }: { authorId?: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(authorId);
  const posts = data.pages.flatMap((page) => page.items);

  if (posts.length === 0) {
    return (
      <div className="p-4">
        <EmptyState title="Здесь пока пусто" hint="Опубликуйте первый пост" />
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCardConnected key={post.id} post={post} />
      ))}
      {hasNextPage && (
        <div className="flex justify-center py-6">
          <UIButton
            variant="outline"
            size="sm"
            loading={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Загрузить ещё
          </UIButton>
        </div>
      )}
    </div>
  );
}
