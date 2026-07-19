'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { UIButton, UIInput, UILabel, UITextarea, useToast } from '@zuko/ui';
import { updateProfileSchema, type Me } from '@zuko/contracts';
import { ApiError, uploadFiles } from '@/shared/api';
import { useUpdateProfile } from '../model/use-update-profile';
import { AvatarPicker } from './avatar-picker';

/** Кроппер нужен только после выбора файла — не тащим его в бандл страницы настроек. */
const AvatarCropper = dynamic(() => import('./avatar-cropper').then((m) => m.AvatarCropper), {
  ssr: false,
});

interface AvatarDraft {
  file: File;
  /** object URL для локального превью — живёт до отправки или замены. */
  url: string;
}

/** Исходник, открытый в кроппере: до «Применить» в черновик не попадает. */
interface CropSource {
  name: string;
  url: string;
}

export function ProfileForm({ user }: { user: Me }) {
  const update = useUpdateProfile();
  const { addToast } = useToast();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);
  const [draft, setDraft] = useState<AvatarDraft | null>(null);
  const [cropSource, setCropSource] = useState<CropSource | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Освобождаем object URL при замене черновика и на размонтировании — иначе течёт память.
  useEffect(() => {
    if (!draft) return;
    return () => URL.revokeObjectURL(draft.url);
  }, [draft]);

  useEffect(() => {
    if (!cropSource) return;
    return () => URL.revokeObjectURL(cropSource.url);
  }, [cropSource]);

  const preview = draft?.url ?? avatarUrl;
  const pending = uploading || update.isPending;

  // Выбранный файл сначала уезжает в кроппер; в черновик попадает уже вырезанный квадрат.
  const pickAvatar = (file: File) => {
    setError(null);
    setCropSource({ name: file.name, url: URL.createObjectURL(file) });
  };

  const applyCrop = (file: File) => {
    setCropSource(null);
    setDraft({ file, url: URL.createObjectURL(file) });
  };

  const removeAvatar = () => {
    setError(null);
    setDraft(null);
    setAvatarUrl(null);
  };

  const submit = async () => {
    setError(null);
    try {
      // Файл заливаем только в момент сохранения — отменённое редактирование не мусорит на диске.
      let nextAvatarUrl = avatarUrl;
      if (draft) {
        setUploading(true);
        const [uploaded] = await uploadFiles([draft.file]);
        nextAvatarUrl = uploaded ?? null;
      }

      const parsed = updateProfileSchema.safeParse({
        displayName,
        bio: bio.trim() === '' ? null : bio,
        avatarUrl: nextAvatarUrl,
      });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? 'Проверьте поля');
        return;
      }

      update.mutate(parsed.data, {
        onSuccess: () => {
          setAvatarUrl(nextAvatarUrl);
          setDraft(null);
          addToast('Профиль обновлён', 'success');
        },
        onError: (e) => setError(e instanceof ApiError ? e.message : 'Не удалось сохранить'),
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось загрузить фото');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md space-y-6 p-4">
      <div className="space-y-4">
        <UILabel>Фото профиля</UILabel>
        <AvatarPicker
          previewUrl={preview}
          displayName={displayName}
          disabled={pending}
          onPick={pickAvatar}
          onRemove={removeAvatar}
          onError={setError}
        />
      </div>

      {cropSource && (
        <AvatarCropper
          src={cropSource.url}
          fileName={cropSource.name}
          onCancel={() => setCropSource(null)}
          onApply={applyCrop}
        />
      )}

      <div className="space-y-3">
        <UILabel htmlFor="displayName">Имя</UILabel>
        <UIInput
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <UILabel htmlFor="bio">О себе</UILabel>
        <UITextarea
          id="bio"
          rows={3}
          maxLength={280}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <UIButton loading={pending} onClick={submit}>
        Сохранить
      </UIButton>
    </div>
  );
}
