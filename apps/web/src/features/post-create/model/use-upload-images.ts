import { useMutation } from '@tanstack/react-query';
import { uploadFiles } from '@/shared/api';

/** Заливает файлы на бэк и возвращает абсолютные URL сохранённых картинок. */
export function useUploadImages() {
  return useMutation({ mutationFn: (files: File[]) => uploadFiles(files) });
}
