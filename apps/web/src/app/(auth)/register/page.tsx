import type { Metadata } from 'next';
import { RegisterPage } from '@/views/auth-register';

export const metadata: Metadata = { title: 'Регистрация' };

export default function Page() {
  return <RegisterPage />;
}
