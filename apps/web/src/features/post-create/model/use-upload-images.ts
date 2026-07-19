import { useMutation } from '@tanstack/react-query';
import { uploadResponseSchema } from '@zuko/contracts';
import { apiFetch } from '@/shared/api';

/** Заливает файлы на бэк и возвращает абсолютные URL сохранённых картинок. */
export function useUploadImages() {
  return useMutation({
    mutationFn: async (files: File[]): Promise<string[]> => {
      const form = new FormData();
      for (const file of files) form.append('files', file);
      const res = await apiFetch<unknown>('/uploads', { method: 'POST', body: form });
      return uploadResponseSchema.parse(res).urls;
    },
  });
}
