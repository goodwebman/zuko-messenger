'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { UIBadge, buttonVariants, cn } from '@zuko/ui';
import { UserAvatar } from '@/entities/user';
import { selectCurrentUser } from '@/entities/session';
import { selectTotalUnread } from '@/entities/conversation';
import { useNotificationsBadge } from '@/entities/notification';
import { LogoutButton } from '@/features/auth';
import {
  BellIcon,
  BrandLogo,
  HomeIcon,
  MessageIcon,
  SettingsIcon,
  UserIcon,
} from '@zuko/ui/app';
import { useAppSelector } from '@/shared/lib';

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: number;
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { icon: ItemIcon } = item;
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'press relative flex items-center gap-3 rounded-lg px-3 py-3 text-base',
        active
          ? 'bg-accent text-bone-text shadow-e1'
          : 'text-cloud-text hover:bg-accent/60 hover:text-bone-text',
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-signal-lime"
        />
      )}
      <ItemIcon className="size-6" />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <UIBadge variant="default" className="min-w-5 animate-pop justify-center">
          {item.badge > 99 ? '99+' : item.badge}
        </UIBadge>
      ) : null}
    </Link>
  );
}

/** Нижняя навигация только для мобилки — прижата к низу экрана, всегда доступна. */
function MobileNav({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <nav
      aria-label="Основная навигация"
      className="glass-deep fixed inset-x-0 bottom-0 z-40 flex border-t border-steel-border pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const { icon: ItemIcon } = item;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            aria-label={item.label}
            className={cn(
              'press relative flex min-w-0 flex-1 flex-col items-center gap-1 px-0.5 py-2.5 text-[10px] leading-tight',
              active ? 'text-signal-lime' : 'text-fog-text',
            )}
          >
            <span className="relative">
              <ItemIcon className="size-6" />
              {item.badge ? (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 animate-pop items-center justify-center rounded-full bg-signal-lime px-1 text-[10px] font-semibold text-ink-well">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              ) : null}
            </span>
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useAppSelector(selectCurrentUser);
  const totalUnread = useAppSelector(selectTotalUnread);
  const { data: notifications } = useNotificationsBadge(Boolean(user));

  // Гостю показываем только ленту: остальные разделы всё равно упрутся в middleware.
  const items: NavItem[] = user
    ? [
        { href: '/feed', label: 'Лента', icon: HomeIcon },
        { href: '/messages', label: 'Сообщения', icon: MessageIcon, badge: totalUnread },
        {
          href: '/notifications',
          label: 'Уведомления',
          icon: BellIcon,
          badge: notifications?.unread,
        },
        { href: `/profile/${user.username}`, label: 'Профиль', icon: UserIcon },
        { href: '/settings', label: 'Настройки', icon: SettingsIcon },
      ]
    : [{ href: '/feed', label: 'Лента', icon: HomeIcon }];

  // На мобилке нет сайдбара с CTA — вход выносим прямо в нижнюю навигацию.
  const mobileItems: NavItem[] = user
    ? items
    : [...items, { href: '/login', label: 'Войти', icon: UserIcon }];

  return (
    <div className="flex min-h-dvh w-full">
      {/* Сайдбар прижат к левому углу (без центрирующего mx-auto), скрыт на мобилке. */}
      <aside className="glass-deep sticky top-0 hidden h-dvh w-68 shrink-0 flex-col border-r border-steel-border p-4 md:flex">
        <div className="px-2 py-3">
          <BrandLogo />
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>
        {user ? (
          <div className="mt-4 flex items-center gap-3 border-t border-steel-border pt-4">
            <UserAvatar user={user} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base text-bone-text">{user.displayName}</p>
              <p className="truncate text-sm text-fog-text">@{user.username}</p>
            </div>
            <LogoutButton />
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5 border-t border-steel-border pt-4">
            <p className="px-1 text-sm leading-relaxed text-fog-text">
              Вы читаете как гость. Войдите, чтобы писать посты и отвечать.
            </p>
            <Link href="/login" className={cn(buttonVariants(), 'press w-full')}>
              Войти
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: 'ghost' }), 'w-full')}
            >
              Создать аккаунт
            </Link>
          </div>
        )}
      </aside>

      {/* Контент на всю ширину области; снизу отступ под мобильный bottom-nav. */}
      <main className="min-w-0 flex-1 pb-20 md:pb-0">
        <div className="w-full">{children}</div>
      </main>

      <MobileNav items={mobileItems} pathname={pathname} />
    </div>
  );
}
