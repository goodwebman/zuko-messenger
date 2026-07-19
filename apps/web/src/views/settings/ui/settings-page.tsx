'use client';

import { selectCurrentUser } from '@/entities/session';
import { ProfileForm } from '@/features/update-profile';
import { PageHeader } from '@/shared/ui';
import { useAppSelector } from '@/shared/lib';

export function SettingsPage() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className="min-h-dvh border-x border-steel-border">
      <PageHeader title="Настройки" />
      {user && <ProfileForm user={user} />}
    </div>
  );
}
