import type { Metadata } from 'next';
import { ConversationPage } from '@/views/conversation';

export const metadata: Metadata = { title: 'Диалог' };

export default function Page() {
  return <ConversationPage />;
}
