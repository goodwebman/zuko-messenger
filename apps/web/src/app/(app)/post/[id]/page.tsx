import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Post } from '@zuko/contracts';
import { env } from '@/shared/config';
import { PostPage } from '@/views/post';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const cookie = (await cookies()).toString();
    const res = await fetch(`${env.API_URL}/api/posts/${id}`, {
      headers: { cookie },
      cache: 'no-store',
    });
    if (!res.ok) return { title: 'Пост' };
    const post: Post = await res.json();
    const snippet = post.body.slice(0, 100);
    return {
      title: `${post.author.displayName}: ${snippet}`,
      description: snippet,
      openGraph: { title: `Пост от ${post.author.displayName}`, description: snippet },
    };
  } catch {
    return { title: 'Пост' };
  }
}

export default function Page() {
  return <PostPage />;
}
