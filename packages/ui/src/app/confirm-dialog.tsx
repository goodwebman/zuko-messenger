'use client';

import type { ReactNode } from 'react';
import { UIButton, UIDialog } from '../components';
import type { IUIButtonProps } from '../components';
import { DialogBackdrop } from './dialog-backdrop';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Вариант кнопки подтверждения — `destructive` для необратимых действий. */
  confirmVariant?: IUIButtonProps['variant'];
  loading?: boolean;
  onConfirm: () => void;
}

/** Модалка подтверждения действия. Кнопка подтверждения получает автофокус. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  confirmVariant = 'primary',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <UIDialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop />
      <UIDialog.Content className="mx-4 max-w-sm rounded-2xl border-steel-border bg-card shadow-e3">
        <UIDialog.Title className="font-satoshi text-xl text-bone-text">{title}</UIDialog.Title>
        {description && (
          <UIDialog.Description className="mt-1.5 text-base text-ash-text">
            {description}
          </UIDialog.Description>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <UIButton variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </UIButton>
          <UIButton autoFocus variant={confirmVariant} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </UIButton>
        </div>
      </UIDialog.Content>
    </UIDialog>
  );
}
