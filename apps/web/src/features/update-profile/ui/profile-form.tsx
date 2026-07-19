'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { UIButton, UIInput, UILabel, UITextarea, useToast } from '@zuko/ui';
import { updateProfileSchema, type Me } from '@zuko/contracts';
import { CameraIcon, UserIcon } from '@zuko/ui/app';
import { ApiError, uploadFiles } from '@/shared/api';
import { useUpdateProfile } from '../model/use-update-profile';
import { AvatarPicker } from './avatar-picker';

/** Кроппер нужен только после выбора файла — не тащим его в бандл страницы настроек. */
const AvatarCropper = dynamic(() => import('./avatar-cropper').then((m) => m.AvatarCropper), {
  ssr: false,
});

/** Исходник, открытый в кроппере: до «Применить» никуда не уходит. */
interface CropSource {
  name: string;
  url: string;
}

export function ProfileForm({ user }: { user: Me }) {
  const update = useUpdateProfile();
  const { addToast } = useToast();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? '');
  const [cropSource, setCropSource] = useState<CropSource | null>(null);
  // Локальный object URL на время загрузки — живёт, пока обновлённый профиль не прилетит в prop.
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);

  useEffect(() => {
    if (!cropSource) return;
    return () => URL.revokeObjectURL(cropSource.url);
  }, [cropSource]);

  const busy = update.isPending || pendingAvatar !== null;
  const previewUrl = pendingAvatar ?? user.avatarUrl;
  // Кнопка «Сохранить» отвечает только за имя/био — фото уходит отдельным патчем сразу.
  const dirty = displayName !== user.displayName || bio !== (user.bio ?? '');

  // Выбранный файл сначала уезжает в кроппер; дальше в аккаунт летит уже вырезанный квадрат.
  const pickAvatar = (file: File) => {
    setAvatarError(null);
    setCropSource({ name: file.name, url: URL.createObjectURL(file) });
  };

  // Фото применяется сразу, без кнопки «Сохранить»: залили файл → пропатчили профиль.
  const applyCrop = async (file: File) => {
    setCropSource(null);
    setAvatarError(null);
    const preview = URL.createObjectURL(file);
    setPendingAvatar(preview);
    try {
      const [uploaded] = await uploadFiles([file]);
      if (!uploaded) throw new Error('upload failed');
      await update.mutateAsync({ avatarUrl: uploaded });
      addToast('Фото профиля обновлено', 'success');
    } catch (e) {
      setAvatarError(e instanceof ApiError ? e.message : 'Не удалось загрузить фото');
    } finally {
      URL.revokeObjectURL(preview);
      setPendingAvatar(null);
    }
  };

  const removeAvatar = async () => {
    setAvatarError(null);
    try {
      await update.mutateAsync({ avatarUrl: null });
      addToast('Фото профиля удалено', 'success');
    } catch (e) {
      setAvatarError(e instanceof ApiError ? e.message : 'Не удалось удалить фото');
    }
  };

  const submitInfo = () => {
    setInfoError(null);
    const parsed = updateProfileSchema.safeParse({
      displayName,
      bio: bio.trim() === '' ? null : bio,
    });
    if (!parsed.success) {
      setInfoError(parsed.error.issues[0]?.message ?? 'Проверьте поля');
      return;
    }
    setSavingInfo(true);
    update.mutate(parsed.data, {
      onSuccess: () => addToast('Профиль обновлён', 'success'),
      onError: (e) => setInfoError(e instanceof ApiError ? e.message : 'Не удалось сохранить'),
      onSettled: () => setSavingInfo(false),
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <section className="overflow-hidden rounded-(--radius) border border-steel-border bg-card shadow-e1">
        <header className="flex items-center gap-2.5 border-b border-steel-border px-5 py-4">
          <CameraIcon className="size-5 text-signal-lime" />
          <h2 className="font-satoshi text-lg font-medium tracking-tight text-bone-text">
            Фото профиля
          </h2>
        </header>
        <div className="p-5">
          <AvatarPicker
            previewUrl={previewUrl}
            displayName={displayName}
            disabled={busy}
            onPick={pickAvatar}
            onRemove={removeAvatar}
            onError={setAvatarError}
          />
          {avatarError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {avatarError}
            </p>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-(--radius) border border-steel-border bg-card shadow-e1">
        <header className="flex items-center gap-2.5 border-b border-steel-border px-5 py-4">
          <UserIcon className="size-5 text-signal-lime" />
          <h2 className="font-satoshi text-lg font-medium tracking-tight text-bone-text">
            Основная информация
          </h2>
        </header>

        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <UILabel htmlFor="displayName">Имя</UILabel>
            <UIInput
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <UILabel htmlFor="bio">О себе</UILabel>
              <span className="text-xs tabular-nums text-fog-text">{bio.length}/280</span>
            </div>
            <UITextarea
              id="bio"
              rows={3}
              maxLength={280}
              value={bio}
              placeholder="Пара слов о себе"
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {infoError && (
            <p role="alert" className="text-sm text-destructive">
              {infoError}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-4 border-t border-steel-border px-5 py-4">
          <span aria-live="polite" className="mr-auto text-sm text-fog-text">
            {dirty ? 'Есть несохранённые изменения' : 'Всё сохранено'}
          </span>
          <UIButton disabled={!dirty || busy} loading={savingInfo} onClick={submitInfo}>
            Сохранить
          </UIButton>
        </footer>
      </section>

      {cropSource && (
        <AvatarCropper
          src={cropSource.url}
          fileName={cropSource.name}
          onCancel={() => setCropSource(null)}
          onApply={applyCrop}
        />
      )}
    </div>
  );
}
