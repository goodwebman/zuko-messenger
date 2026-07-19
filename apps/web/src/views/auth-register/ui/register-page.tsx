import { Suspense } from 'react';
import { RegisterForm } from '@/features/auth';

export function RegisterPage() {
  // useSearchParams (?next=) требует Suspense-границы при статическом рендере страницы.
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
