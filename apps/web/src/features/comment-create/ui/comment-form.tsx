'use client';

import { useState } from 'react';
import { UIButton, cn } from '@zuko/ui';
import { createCommentSchema, type Me } from '@zuko/contracts';
import { UserAvatar } from '@/entities/user';
import { AutoTextarea, SendIcon } from '@zuko/ui/app';
import { useCreateComment } from '../model/use-create-comment';

const MAX = 1000;
/** Порог, с которого счётчик перестаёт быть шумом и начинает нести смысл. */
const COUNTER_FROM = MAX - 200;

export function CommentForm({ postId, user }: { postId: string; user: Me }) {
  const create = useCreateComment(postId);
  const [body, setBody] = useState('');

  const parsed = createCommentSchema.safeParse({ body: body.trim() });
  const canSend = parsed.success && !create.isPending;

  const submit = () => {
    if (!parsed.success || create.isPending) return;
    create.mutate(parsed.data, { onSuccess: () => setBody('') });
  };

  return (
    <div className="px-4 py-4">
      <div
        className={cn(
          'flex gap-3 rounded-2xl border border-steel-border bg-ink-well/70 p-3 shadow-e1',
          'transition-[border-color,box-shadow] duration-(--dur-base) ease-smooth',
          'focus-within:border-graphite-hairline focus-within:shadow-e2',
        )}
      >
        <UserAvatar user={user} className="size-10" />

        <div className="min-w-0 flex-1">
          <AutoTextarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            // ⌘/Ctrl+Enter — отправка, обычный Enter оставляем для переноса строки.
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Написать комментарий…"
            maxLength={MAX}
            aria-label="Текст комментария"
            className="py-1"
          />

          <div className="mt-2 flex items-center justify-end gap-3">
            {body.length >= COUNTER_FROM && (
              <span
                className={cn(
                  'text-xs tabular-nums',
                  body.length >= MAX ? 'font-medium text-destructive' : 'text-fog-text',
                )}
              >
                {body.length}/{MAX}
              </span>
            )}
            <UIButton
              className="press rounded-full px-5"
              disabled={!canSend}
              loading={create.isPending}
              onClick={submit}
            >
              {!create.isPending && <SendIcon className="size-4.5" />}
              Ответить
            </UIButton>
          </div>
        </div>
      </div>
    </div>
  );
}
