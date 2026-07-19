'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@zuko/contracts';
import { UIButton, UIInput } from '@zuko/ui';
import { ApiError } from '@/shared/api';
import { useLogin } from '../model/use-auth';
import { safeNext } from '../lib/safe-next';
import { AuthCard, AuthField, AuthSwitch } from './auth-shell';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const next = safeNext(params.get('next'));

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, { onSuccess: () => router.replace(next) });
  });

  const serverError = login.error instanceof ApiError ? login.error.message : null;

  return (
    <AuthCard title="Вход" description="Рады видеть снова">
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField id="login" label="Username или email">
          <UIInput
            id="login"
            autoComplete="username"
            error={errors.login?.message}
            {...register('login')}
          />
        </AuthField>

        <AuthField id="password" label="Пароль">
          <UIInput
            id="password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </AuthField>

        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}

        <UIButton type="submit" size="lg" loading={login.isPending} className="press w-full">
          Войти
        </UIButton>

        <AuthSwitch
          question="Нет аккаунта?"
          href={`/register?next=${encodeURIComponent(next)}`}
          action="Регистрация"
        />
      </form>
    </AuthCard>
  );
}
