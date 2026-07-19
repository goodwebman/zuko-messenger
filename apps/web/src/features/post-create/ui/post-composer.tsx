'use client';

import { useRef, useState } from 'react';
import { UIButton, cn } from '@zuko/ui';
import { MAX_POST_IMAGES, type Me } from '@zuko/contracts';
import { UserAvatar } from '@/entities/user';
import { AutoTextarea, CloseIcon, ImageIcon } from '@zuko/ui/app';
import { useCreatePost } from '../model/use-create-post';
import { useUploadImages } from '../model/use-upload-images';

interface Draft {
  file: File;
  url: string;
}

export function PostComposer({ user }: { user: Me }) {
  const createPost = useCreatePost();
  const upload = useUploadImages();
  const [body, setBody] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const pending = createPost.isPending || upload.isPending;
  const canPost = (body.trim().length > 0 || drafts.length > 0) && body.length <= 2000 && !pending;

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const room = MAX_POST_IMAGES - drafts.length;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, room)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setDrafts((prev) => [...prev, ...picked]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeDraft = (url: string) => {
    URL.revokeObjectURL(url);
    setDrafts((prev) => prev.filter((d) => d.url !== url));
  };

  const reset = () => {
    drafts.forEach((d) => URL.revokeObjectURL(d.url));
    setDrafts([]);
    setBody('');
  };

  const submit = async () => {
    if (!canPost) return;
    const images = drafts.length ? await upload.mutateAsync(drafts.map((d) => d.file)) : [];
    createPost.mutate({ body: body.trim(), images }, { onSuccess: reset });
  };

  const full = drafts.length >= MAX_POST_IMAGES;

  return (
    <div className="border-b border-steel-border px-4 py-4">
      <div
        className={cn(
          'rounded-2xl border border-steel-border bg-card/60 p-3 shadow-e1',
          'transition-[border-color,box-shadow] duration-(--dur-base) ease-smooth',
          'focus-within:border-graphite-hairline focus-within:shadow-e2',
        )}
      >
        <div className="flex gap-3">
          <UserAvatar user={user} />

          <div className="min-w-0 flex-1">
            <AutoTextarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Что нового?"
              maxLength={2000}
              aria-label="Текст поста"
              className="py-2 text-base"
            />

            {drafts.length > 0 && (
              <div className="mt-3 grid max-w-90 grid-cols-4 gap-2">
                {drafts.map((d) => (
                  <div
                    key={d.url}
                    className="relative aspect-square overflow-hidden rounded-lg border border-steel-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.url} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeDraft(d.url)}
                      aria-label="Убрать фото"
                      className="press absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-ink-well/85 text-bone-text backdrop-blur transition hover:bg-ink-well"
                    >
                      <CloseIcon className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {upload.isError && (
              <p role="alert" className="mt-2 text-xs text-destructive">
                {upload.error instanceof Error ? upload.error.message : 'Не удалось загрузить фото'}
              </p>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => addFiles(e.target.files)}
            />

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-steel-border pt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={full || pending}
                  aria-label="Прикрепить фото"
                  title={full ? `Максимум ${MAX_POST_IMAGES} фото` : 'Прикрепить фото'}
                  className={cn(
                    'press flex items-center justify-center rounded-lg p-2 text-signal-lime transition-colors hover:bg-accent',
                    (full || pending) && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                  )}
                >
                  <ImageIcon className="size-6" />
                </button>
                {drafts.length > 0 && (
                  <span className="text-xs tabular-nums text-fog-text">
                    {drafts.length}/{MAX_POST_IMAGES}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {body.length >= 1800 && (
                  <span
                    className={cn(
                      'text-xs tabular-nums',
                      body.length >= 2000 ? 'font-medium text-destructive' : 'text-fog-text',
                    )}
                  >
                    {body.length}/2000
                  </span>
                )}
                <UIButton
                  className="press rounded-full px-5"
                  disabled={!canPost}
                  loading={pending}
                  onClick={submit}
                >
                  Опубликовать
                </UIButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
