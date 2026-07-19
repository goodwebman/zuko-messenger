import type { Metadata } from 'next';
import { NotificationsPage } from '@/views/notifications';

export const metadata: Metadata = { title: 'Уведомления' };

export default function Page() {
  return <NotificationsPage />;
}
