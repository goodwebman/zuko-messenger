import { z } from 'zod';

/** Разрешённые типы загружаемых картинок (валидируются и по mime, и по magic-bytes на бэке). */
export const ALLOWED_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/** Ответ эндпоинта загрузки — абсолютные URL сохранённых файлов. */
export const uploadResponseSchema = z.object({
  urls: z.array(z.string().url()),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;
