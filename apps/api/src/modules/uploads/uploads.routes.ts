import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { FastifyInstance } from 'fastify';
import { ALLOWED_IMAGE_MIME, MAX_POST_IMAGES, type UploadResponse } from '@zuko/contracts';
import { env } from '../../env';
import { authenticate } from '../../lib/auth';
import { badRequest } from '../../lib/errors';
import { sniffImage } from './uploads.service';

const allowedMime = new Set<string>(ALLOWED_IMAGE_MIME);

/**
 * Загрузка картинок для постов. Принимает multipart/form-data (поле `files`).
 * Обработка на бэке: проверка mime → чтение с лимитом размера → сверка magic-bytes
 * (защита от подмены content-type) → сохранение под случайным именем → отдача абсолютных URL.
 * Файлы раздаёт @fastify/static по префиксу /uploads/.
 */
export async function uploadsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);
  const dir = resolve(env.UPLOAD_DIR);

  app.post('/uploads', async (req): Promise<UploadResponse> => {
    if (!req.isMultipart()) throw badRequest('Ожидается multipart/form-data');

    const urls: string[] = [];
    for await (const part of req.files()) {
      if (urls.length >= MAX_POST_IMAGES) break;
      if (!allowedMime.has(part.mimetype)) {
        throw badRequest('Недопустимый тип файла — только JPEG/PNG/WebP/GIF');
      }

      // toBuffer соблюдает fileSize-лимит из регистрации multipart (иначе бросит 413).
      const buf = await part.toBuffer();
      const kind = sniffImage(buf);
      if (!kind) throw badRequest('Файл не является корректным изображением');

      const filename = `${randomUUID()}.${kind.ext}`;
      await writeFile(join(dir, filename), buf);
      urls.push(`${env.API_PUBLIC_URL}/uploads/${filename}`);
    }

    if (urls.length === 0) throw badRequest('Не приложено ни одного файла');
    return { urls };
  });
}
