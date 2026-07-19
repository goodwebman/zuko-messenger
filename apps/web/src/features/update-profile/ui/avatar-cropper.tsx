'use client';

import { useCallback, useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { Minus, Plus, UIButton, UIDialog, UISlider } from '@zuko/ui';
import { DialogBackdrop } from '@zuko/ui/app';
import { cropImageToFile } from '../lib/crop-image';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;

interface AvatarCropperProps {
  /** object URL исходника. Компонент монтируется только на время кадрирования. */
  src: string;
  /** Имя исходного файла — переносим на результат, чтобы не терять контекст. */
  fileName: string;
  onCancel: () => void;
  onApply: (file: File) => void;
}

/**
 * Кадрирование аватара: перетаскивание, зум колесом/щипком/ползунком, круглая
 * рамка 1:1. Резка — в canvas на клиенте, на бэк уезжает уже готовый квадрат.
 */
export function AvatarCropper({ src, fileName, onCancel, onApply }: AvatarCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Колбэк уходит в пропсы Cropper — держим ссылку стабильной.
  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  const apply = async () => {
    if (!area) return;
    setBusy(true);
    setError(null);
    try {
      // Расширение меняем на .jpg: на выходе всегда JPEG, каким бы ни был вход.
      const name = `${fileName.replace(/\.[^.]+$/, '')}.jpg`;
      onApply(await cropImageToFile(src, area, name));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось обрезать изображение');
      setBusy(false);
    }
  };

  return (
    <UIDialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onCancel();
      }}
    >
      <DialogBackdrop />
      <UIDialog.Content
        persistent
        className="mx-4 w-full max-w-lg rounded-2xl border-steel-border bg-card p-5 shadow-e3"
      >
        <UIDialog.Title className="font-satoshi text-xl text-bone-text">
          Кадрирование фото
        </UIDialog.Title>
        <UIDialog.Description className="mt-1.5 text-base text-ash-text">
          Потяните фото, чтобы выбрать область, и приблизьте до нужного масштаба.
        </UIDialog.Description>

        <div className="relative mt-4 h-80 overflow-hidden rounded-xl border border-steel-border bg-ink-well">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            zoomSpeed={0.3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            aria-label="Отдалить"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
            className="press flex size-9 shrink-0 items-center justify-center rounded-lg text-cloud-text transition-colors hover:bg-accent"
          >
            <Minus className="size-5" />
          </button>
          <UISlider
            value={zoom}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={ZOOM_STEP}
            onValueChange={setZoom}
            aria-label="Масштаб"
          />
          <button
            type="button"
            aria-label="Приблизить"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
            className="press flex size-9 shrink-0 items-center justify-center rounded-lg text-cloud-text transition-colors hover:bg-accent"
          >
            <Plus className="size-5" />
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <UIButton variant="ghost" disabled={busy} onClick={onCancel}>
            Отмена
          </UIButton>
          <UIButton loading={busy} disabled={!area} onClick={apply}>
            Применить
          </UIButton>
        </div>
      </UIDialog.Content>
    </UIDialog>
  );
}
