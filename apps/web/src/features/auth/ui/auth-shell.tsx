import Link from 'next/link';
import type { ReactNode } from 'react';
import { UILabel } from '@zuko/ui';

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

/** Карточка формы входа/регистрации: общий ритм заголовка, полей и подвала. */
export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="rounded-2xl border border-steel-border bg-card/80 p-7 shadow-e3 backdrop-blur-sm">
      <div className="space-y-1.5">
        <h1 className="font-satoshi text-2xl font-semibold tracking-tight text-bone-text">
          {title}
        </h1>
        <p className="text-sm text-fog-text">{description}</p>
      </div>
      <div className="mt-7">{children}</div>
    </div>
  );
}

interface AuthFieldProps {
  id: string;
  label: string;
  children: ReactNode;
}

/** Пара «подпись + поле». Отступ между ними задан здесь, чтобы он был одинаковым везде. */
export function AuthField({ id, label, children }: AuthFieldProps) {
  return (
    <div className="space-y-5">
      <UILabel htmlFor={id} className="text-cloud-text">
        {label}
      </UILabel>
      {children}
    </div>
  );
}

interface AuthSwitchProps {
  question: string;
  href: string;
  action: string;
}

/**
 * Подвал формы «Нет аккаунта? → Регистрация». Вопрос и ссылка разведены по краям
 * карточки (`justify-between`), а не слеплены инлайном в центре: так ссылка
 * читается как отдельное действие и в неё проще попасть.
 */
export function AuthSwitch({ question, href, action }: AuthSwitchProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-steel-border pt-5 text-sm">
      <span className="text-fog-text">{question}</span>
      <Link href={href} className="font-medium text-signal-lime hover:underline">
        {action}
      </Link>
    </div>
  );
}
