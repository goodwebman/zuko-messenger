'use client';

import { useRef, useState } from 'react';
import { UIButton, UITextarea, cn } from '@zuko/ui';
import { MAX_POST_IMAGES, type Me } from '@zuko/contracts';
import { UserAvatar } from '@/entities/user';
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

  return (
    <div className="flex gap-3 border-b border-steel-border px-4 py-4">
      <UserAvatar user={user} />
      <div className="min-w-0 flex-1">
        <UITextarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Что нового?"
          rows={2}
          className="resize-none border-0 bg-transparent px-0 focus-visible:ring-0"
          maxLength={2000}
        />

        {drafts.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {drafts.map((d) => (
              <div
                key={d.url}
                className="ring-hairline group relative aspect-square overflow-hidden rounded-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.url} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeDraft(d.url)}
                  aria-label="Убрать фото"
                  className="press absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-ink-well/80 text-bone-text backdrop-blur transition hover:bg-ink-well"
                >
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {upload.isError && (
          <p className="mt-2 text-xs text-destructive">
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

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={drafts.length >= MAX_POST_IMAGES || pending}
              aria-label="Прикрепить фото"
              title={
                drafts.length >= MAX_POST_IMAGES ? `Максимум ${MAX_POST_IMAGES} фото` : 'Прикрепить фото'
              }
              className={cn(
                'press flex items-center justify-center rounded-lg p-1.5 text-signal-lime transition hover:bg-accent',
                (drafts.length >= MAX_POST_IMAGES || pending) && 'cursor-not-allowed opacity-40',
              )}
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 20" />
              </svg>
            </button>
            <span className="text-xs text-fog-text">{body.length}/2000</span>
          </div>
          <UIButton size="sm" disabled={!canPost} loading={pending} onClick={submit}>
            Опубликовать
          </UIButton>
        </div>
      </div>
    </div>
  );
}
