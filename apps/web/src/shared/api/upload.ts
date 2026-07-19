import { ALLOWED_IMAGE_MIME, uploadResponseSchema } from '@zuko/contracts';
import { apiFetch } from './api-client';

/** Максимальный размер файла — зеркалит MAX_UPLOAD_MB на бэке (иначе получим 413). */
export const MAX_UPLOAD_MB = 5;

/** Заливает файлы на бэк и возвращает абсолютные URL сохранённых картинок. */
export async function uploadFiles(files: File[]): Promise<string[]> {
  const form = new FormData();
  for (const file of files) form.append('files', file);
  const res = await apiFetch<unknown>('/uploads', { method: 'POST', body: form });
  return uploadResponseSchema.parse(res).urls;
}

/**
 * Предварительная проверка на клиенте — чтобы не гонять заведомо плохой файл по сети.
 * Настоящая валидация (mime + magic bytes) всё равно на бэке.
 * @returns текст ошибки или null, если файл подходит
 */
export function validateImageFile(
  file: File,
  accept: readonly string[] = ALLOWED_IMAGE_MIME,
): string | null {
  if (!accept.includes(file.type)) return 'Неподдерживаемый формат файла';
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return `Файл больше ${MAX_UPLOAD_MB} МБ`;
  return null;
}
