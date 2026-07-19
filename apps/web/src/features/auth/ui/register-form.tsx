'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@zuko/contracts';
import { UIButton, UICard, UIInput, UILabel } from '@zuko/ui';
import { ApiError } from '@/shared/api';
import { useRegister } from '../model/use-auth';

export function RegisterForm() {
  const router = useRouter();
  const signup = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit((values) => {
    signup.mutate(values, { onSuccess: () => router.replace('/feed') });
  });

  const serverError = signup.error instanceof ApiError ? signup.error.message : null;

  return (
    <UICard>
      <UICard.Header>
        <UICard.Title>Регистрация</UICard.Title>
        <UICard.Description>Создайте аккаунт в Zuko</UICard.Description>
      </UICard.Header>
      <form onSubmit={onSubmit}>
        <UICard.Content className="space-y-4">
          <div className="space-y-1.5">
            <UILabel htmlFor="displayName">Имя</UILabel>
            <UIInput
              id="displayName"
              error={errors.displayName?.message}
              {...register('displayName')}
            />
          </div>
          <div className="space-y-1.5">
            <UILabel htmlFor="username">Username</UILabel>
            <UIInput
              id="username"
              autoComplete="username"
              error={errors.username?.message}
              {...register('username')}
            />
          </div>
          <div className="space-y-1.5">
            <UILabel htmlFor="email">Email</UILabel>
            <UIInput
              id="email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <div className="space-y-1.5">
            <UILabel htmlFor="password">Пароль</UILabel>
            <UIInput
              id="password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        </UICard.Content>
        <UICard.Footer className="flex-col items-stretch gap-3">
          <UIButton type="submit" loading={signup.isPending} className="w-full">
            Создать аккаунт
          </UIButton>
          <p className="text-center text-sm text-fog-text">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-signal-lime hover:underline">
              Войти
            </Link>
          </p>
        </UICard.Footer>
      </form>
    </UICard>
  );
}
