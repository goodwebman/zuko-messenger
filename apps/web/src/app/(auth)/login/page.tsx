import type { Metadata } from 'next';
import { LoginPage } from '@/views/auth-login';

export const metadata: Metadata = { title: 'Вход' };

export default function Page() {
  return <LoginPage />;
}
