import type { Metadata } from 'next';
import { FeedPage } from '@/views/feed';

export const metadata: Metadata = { title: 'Лента' };

export default function Page() {
  return <FeedPage />;
}
