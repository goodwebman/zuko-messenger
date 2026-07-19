import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/shared/api';
import { queryKeys } from '@/shared/config';
import { patchPost } from '@/entities/post';

interface LikeResult {
  postId: string;
  likedByMe: boolean;
  likeCount: number;
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      apiFetch<LikeResult>(`/posts/${id}/like`, { method: liked ? 'DELETE' : 'POST' }),
    onMutate: ({ id, liked }) => {
      patchPost(qc, id, (p) => ({
        ...p,
        likedByMe: !liked,
        likeCount: p.likeCount + (liked ? -1 : 1),
      }));
    },
    onError: (_e, { id }) => {
      void qc.invalidateQueries({ queryKey: queryKeys.post(id) });
      void qc.invalidateQueries({ queryKey: ['feed'] });
    },
    onSuccess: (res) => {
      patchPost(qc, res.postId, (p) => ({
        ...p,
        likedByMe: res.likedByMe,
        likeCount: res.likeCount,
      }));
    },
  });
}
