'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@zuko/contracts';
import { UIButton, UICard, UIInput, UILabel } from '@zuko/ui';
import { ApiError } from '@/shared/api';
import { useLogin } from '../model/use-auth';

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, { onSuccess: () => router.replace('/feed') });
  });

  const serverError = login.error instanceof ApiError ? login.error.message : null;

  return (
    <UICard>
      <UICard.Header>
        <UICard.Title>Вход</UICard.Title>
        <UICard.Description>Рады видеть снова</UICard.Description>
      </UICard.Header>
      <form onSubmit={onSubmit}>
        <UICard.Content className="space-y-4">
          <div className="space-y-1.5">
            <UILabel htmlFor="login">Username или email</UILabel>
            <UIInput
              id="login"
              autoComplete="username"
              error={errors.login?.message}
              {...register('login')}
            />
          </div>
          <div className="space-y-1.5">
            <UILabel htmlFor="password">Пароль</UILabel>
            <UIInput
              id="password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        </UICard.Content>
        <UICard.Footer className="flex-col items-stretch gap-3">
          <UIButton type="submit" loading={login.isPending} className="w-full">
            Войти
          </UIButton>
          <p className="text-center text-sm text-fog-text">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-signal-lime hover:underline">
              Регистрация
            </Link>
          </p>
        </UICard.Footer>
      </form>
    </UICard>
  );
}
