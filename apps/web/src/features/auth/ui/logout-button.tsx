'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog, LogOutIcon } from '@zuko/ui/app';
import { useLogout } from '../model/use-auth';

/** Выход из аккаунта — только через подтверждение, случайный клик ничего не ломает. */
export function LogoutButton() {
  const router = useRouter();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  const confirm = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setOpen(false);
        router.replace('/login');
      },
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Выйти"
        aria-label="Выйти"
        className="press rounded-lg p-2 text-fog-text transition-colors hover:bg-accent hover:text-destructive"
      >
        <LogOutIcon className="size-5" />
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Выйти из аккаунта?"
        description="Сессия завершится на этом устройстве. Чтобы вернуться, нужно будет войти заново."
        confirmLabel="Выйти"
        confirmVariant="destructive"
        loading={logout.isPending}
        onConfirm={confirm}
      />
    </>
  );
}
