import { z } from 'zod';
import { userPublicSchema } from './user';

/** Максимум картинок на пост. */
export const MAX_POST_IMAGES = 4;

const postImagesSchema = z.array(z.string().url()).max(MAX_POST_IMAGES).default([]);

export const createPostSchema = z
  .object({
    body: z.string().max(2000).default(''),
    images: postImagesSchema,
  })
  .refine((d) => d.body.trim().length > 0 || d.images.length > 0, {
    message: 'Добавьте текст или хотя бы одно фото',
    path: ['body'],
  });

export const updatePostSchema = z.object({
  body: z.string().min(1).max(2000),
});

export const repostSchema = z.object({
  body: z.string().max(2000).optional().default(''),
});

/** Пост в ленте с агрегатами и флагами для текущего юзера. */
export const postSchema: z.ZodType<Post> = z.lazy(() =>
  z.object({
    id: z.string(),
    body: z.string(),
    images: z.array(z.string()),
    author: userPublicSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    likeCount: z.number(),
    commentCount: z.number(),
    repostCount: z.number(),
    likedByMe: z.boolean(),
    repostOf: postSchema.nullable(),
  }),
);

export interface Post {
  id: string;
  body: string;
  images: string[];
  author: z.infer<typeof userPublicSchema>;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  likedByMe: boolean;
  repostOf: Post | null;
}

/** Курсорная пагинация ленты. */
export const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  authorId: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type RepostInput = z.infer<typeof repostSchema>;
export type FeedQuery = z.infer<typeof feedQuerySchema>;

export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
}
