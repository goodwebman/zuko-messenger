'use client';

import { useState } from 'react';
import { UIButton, UIInput, UILabel, UITextarea, useToast } from '@zuko/ui';
import { updateProfileSchema, type Me } from '@zuko/contracts';
import { useUpdateProfile } from '../model/use-update-profile';

export function ProfileForm({ user }: { user: Me }) {
  const update = useUpdateProfile();
  const { addToast } = useToast();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    const parsed = updateProfileSchema.safeParse({
      displayName,
      bio: bio.trim() === '' ? null : bio,
      avatarUrl: avatarUrl.trim() === '' ? null : avatarUrl,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Проверьте поля');
      return;
    }
    update.mutate(parsed.data, {
      onSuccess: () => addToast('Профиль обновлён', 'success'),
      onError: () => setError('Не удалось сохранить'),
    });
  };

  return (
    <div className="max-w-md space-y-4 p-4">
      <div className="space-y-1.5">
        <UILabel htmlFor="displayName">Имя</UILabel>
        <UIInput
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <UILabel htmlFor="avatarUrl">Ссылка на аватар</UILabel>
        <UIInput
          id="avatarUrl"
          placeholder="https://…"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <UILabel htmlFor="bio">О себе</UILabel>
        <UITextarea
          id="bio"
          rows={3}
          maxLength={280}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <UIButton loading={update.isPending} onClick={submit}>
        Сохранить
      </UIButton>
    </div>
  );
}
