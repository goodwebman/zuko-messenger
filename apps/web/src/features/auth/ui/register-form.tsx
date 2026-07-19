'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@zuko/contracts';
import { UIButton, UIInput } from '@zuko/ui';
import { ApiError } from '@/shared/api';
import { useRegister } from '../model/use-auth';
import { safeNext } from '../lib/safe-next';
import { AuthCard, AuthField, AuthSwitch } from './auth-shell';

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const signup = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const next = safeNext(params.get('next'));

  const onSubmit = handleSubmit((values) => {
    signup.mutate(values, { onSuccess: () => router.replace(next) });
  });

  const serverError = signup.error instanceof ApiError ? signup.error.message : null;

  return (
    <AuthCard title="Регистрация" description="Создайте аккаунт в Zuko">
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id="displayName" label="Имя">
          <UIInput
            id="displayName"
            error={errors.displayName?.message}
            {...register('displayName')}
          />
        </AuthField>

        <AuthField id="username" label="Username">
          <UIInput
            id="username"
            autoComplete="username"
            error={errors.username?.message}
            {...register('username')}
          />
        </AuthField>

        <AuthField id="email" label="Email">
          <UIInput
            id="email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
        </AuthField>

        <AuthField id="password" label="Пароль">
          <UIInput
            id="password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </AuthField>

        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}

        <UIButton type="submit" size="lg" loading={signup.isPending} className="press w-full">
          Создать аккаунт
        </UIButton>

        <AuthSwitch
          question="Уже есть аккаунт?"
          href={`/login?next=${encodeURIComponent(next)}`}
          action="Войти"
        />
      </form>
    </AuthCard>
  );
}
