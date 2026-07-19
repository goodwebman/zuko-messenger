import { Suspense } from 'react';
import { LoginForm } from '@/features/auth';

export function LoginPage() {
  // useSearchParams (?next=) требует Suspense-границы при статическом рендере страницы.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
