'use client';

import { usePostSuspense } from '@/entities/post';
import { useCommentsSuspense, CommentItem } from '@/entities/comment';
import { selectCurrentUser } from '@/entities/session';
import { PostCardConnected } from '@/widgets/post-card';
import { CommentForm } from '@/features/comment-create';
import { AuthCta } from '@/features/auth';
import { EmptyState } from '@zuko/ui/app';
import { useAppSelector } from '@/shared/lib';

export function PostDetail({ postId }: { postId: string }) {
  const { data: post } = usePostSuspense(postId);
  const { data: comments } = useCommentsSuspense(postId);
  const me = useAppSelector(selectCurrentUser);

  return (
    <>
      <PostCardConnected post={post} />

      {comments.length === 0 ? (
        <div className="p-4">
          <EmptyState title="Пока нет комментариев" hint="Будьте первым" />
        </div>
      ) : (
        <section aria-label="Комментарии">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </section>
      )}

      {/* Композер под лентой комментариев — как в чате, ответ пишется «в конце разговора». */}
      {me ? (
        <CommentForm postId={postId} user={me} />
      ) : (
        <AuthCta title="Чтобы ответить, нужен аккаунт" action="Войти и ответить" />
      )}
    </>
  );
}
