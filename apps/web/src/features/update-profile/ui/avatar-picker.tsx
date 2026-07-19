'use client';

import { useRef } from 'react';
import { UIAvatar, UIButton, cn } from '@zuko/ui';
import { MAX_UPLOAD_MB, validateImageFile } from '@/shared/api';
import { CameraIcon, TrashIcon } from '@zuko/ui/app';
import { initials } from '@/shared/lib';

/** Аватар грузим только картинкой с устройства — из соцсетевых форматов достаточно JPG/PNG. */
export const AVATAR_MIME = ['image/jpeg', 'image/png'] as const;

interface AvatarPickerProps {
  /** Что показываем: локальный preview или уже сохранённый URL. */
  previewUrl: string | null;
  displayName: string;
  disabled?: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
  onError: (message: string) => void;
}

export function AvatarPicker({
  previewUrl,
  displayName,
  disabled = false,
  onPick,
  onRemove,
  onError,
}: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    // Сбрасываем сразу, иначе повторный выбор того же файла не даст change.
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;

    const error = validateImageFile(file, AVATAR_MIME);
    if (error) {
      onError(error);
      return;
    }
    onPick(file);
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        aria-label="Загрузить фото профиля"
        className={cn(
          'press group relative rounded-full',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-lime focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <UIAvatar className="size-24 border border-steel-border">
          {previewUrl && <UIAvatar.Image src={previewUrl} alt="" />}
          <UIAvatar.Fallback className="text-2xl">{initials(displayName)}</UIAvatar.Fallback>
        </UIAvatar>
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center rounded-full bg-ink-well/65 opacity-0 backdrop-blur-[2px] transition-opacity duration-(--dur-base) group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <CameraIcon className="size-8 text-bone-text" />
        </span>
      </button>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <UIButton variant="outline" disabled={disabled} onClick={() => inputRef.current?.click()}>
            <CameraIcon className="size-5" />
            {previewUrl ? 'Заменить' : 'Загрузить фото'}
          </UIButton>
          {previewUrl && (
            <UIButton variant="ghost" disabled={disabled} onClick={onRemove}>
              <TrashIcon className="size-5" />
              Удалить
            </UIButton>
          )}
        </div>
        <p className="mt-2 text-sm text-fog-text">
          JPG или PNG, до {MAX_UPLOAD_MB} МБ — кадрируйте и фото сохранится сразу
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_MIME.join(',')}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
