import { describe, expect, it } from 'vitest';
import type { Paginated, Post, UserPublic } from '@zuko/contracts';
import { updatePostInPages } from './patch-post';

const author: UserPublic = {
  id: 'u1',
  username: 'alice',
  displayName: 'Alice',
  avatarUrl: null,
  bio: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const makePost = (id: string, overrides: Partial<Post> = {}): Post => ({
  id,
  body: `post ${id}`,
  images: [],
  author,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  likeCount: 0,
  commentCount: 0,
  repostCount: 0,
  likedByMe: false,
  repostOf: null,
  ...overrides,
});

const pages = (posts: Post[]): Paginated<Post>[] => [{ items: posts, nextCursor: null }];

describe('updatePostInPages', () => {
  it('обновляет пост по id', () => {
    const result = updatePostInPages(pages([makePost('a'), makePost('b')]), 'a', (p) => ({
      ...p,
      likeCount: 1,
      likedByMe: true,
    }));
    expect(result[0]!.items[0]!.likeCount).toBe(1);
    expect(result[0]!.items[0]!.likedByMe).toBe(true);
    expect(result[0]!.items[1]!.likeCount).toBe(0);
  });

  it('обновляет оригинал внутри репоста', () => {
    const original = makePost('orig', { likeCount: 5 });
    const repost = makePost('rp', { repostOf: original });
    const result = updatePostInPages(pages([repost]), 'orig', (p) => ({
      ...p,
      likeCount: p.likeCount + 1,
    }));
    expect(result[0]!.items[0]!.repostOf!.likeCount).toBe(6);
  });

  it('не мутирует исходный массив', () => {
    const input = pages([makePost('a')]);
    const result = updatePostInPages(input, 'a', (p) => ({ ...p, likeCount: 99 }));
    expect(input[0]!.items[0]!.likeCount).toBe(0);
    expect(result).not.toBe(input);
  });
});
