'use client';

import { useState } from 'react';
import { UIButton, UITextarea } from '@zuko/ui';
import { createCommentSchema, type Me } from '@zuko/contracts';
import { UserAvatar } from '@/entities/user';
import { useCreateComment } from '../model/use-create-comment';

export function CommentForm({ postId, user }: { postId: string; user: Me }) {
  const create = useCreateComment(postId);
  const [body, setBody] = useState('');

  const parsed = createCommentSchema.safeParse({ body });
  const submit = () => {
    if (!parsed.success) return;
    create.mutate(parsed.data, { onSuccess: () => setBody('') });
  };

  return (
    <div className="flex gap-3 border-b border-steel-border px-4 py-4">
      <UserAvatar user={user} />
      <div className="min-w-0 flex-1">
        <UITextarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Написать комментарий…"
          rows={2}
          className="resize-none border-0 bg-transparent px-0 focus-visible:ring-0"
          maxLength={1000}
        />
        <div className="mt-2 flex justify-end">
          <UIButton
            size="sm"
            disabled={!parsed.success || create.isPending}
            loading={create.isPending}
            onClick={submit}
          >
            Ответить
          </UIButton>
        </div>
      </div>
    </div>
  );
}
