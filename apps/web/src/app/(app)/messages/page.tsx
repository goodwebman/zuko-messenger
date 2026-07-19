import type { Metadata } from 'next';
import { MessagesPage } from '@/views/messages';

export const metadata: Metadata = { title: 'Сообщения' };

export default function Page() {
  return <MessagesPage />;
}
