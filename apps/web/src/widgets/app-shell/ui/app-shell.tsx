'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { UIBadge, cn } from '@zuko/ui';
import { UserAvatar } from '@/entities/user';
import { selectCurrentUser } from '@/entities/session';
import { selectTotalUnread } from '@/entities/conversation';
import { useNotificationsBadge } from '@/entities/notification';
import { useLogout } from '@/features/auth';
import { BrandLogo } from '@/shared/ui';
import { useAppSelector } from '@/shared/lib';
import { BellIcon, HomeIcon, MessageIcon, SettingsIcon, UserIcon } from './nav-icons';

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
        'press relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm',
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
      <ItemIcon />
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
              'press relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]',
              active ? 'text-signal-lime' : 'text-fog-text',
            )}
          >
            <span className="relative">
              <ItemIcon />
              {item.badge ? (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 animate-pop items-center justify-center rounded-full bg-signal-lime px-1 text-[9px] font-semibold text-ink-well">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              ) : null}
            </span>
            <span>{item.label}</span>
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
  const logout = useLogout();

  const items: NavItem[] = [
    { href: '/feed', label: 'Лента', icon: HomeIcon },
    { href: '/messages', label: 'Сообщения', icon: MessageIcon, badge: totalUnread },
    { href: '/notifications', label: 'Уведомления', icon: BellIcon, badge: notifications?.unread },
    { href: user ? `/profile/${user.username}` : '/feed', label: 'Профиль', icon: UserIcon },
    { href: '/settings', label: 'Настройки', icon: SettingsIcon },
  ];

  return (
    <div className="flex min-h-dvh w-full">
      {/* Сайдбар прижат к левому углу (без центрирующего mx-auto), скрыт на мобилке. */}
      <aside className="glass-deep sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-steel-border p-4 md:flex">
        <div className="px-2 py-3">
          <BrandLogo />
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
          ))}
        </nav>
        {user && (
          <div className="mt-4 flex items-center gap-3 border-t border-steel-border pt-4">
            <UserAvatar user={user} className="size-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-bone-text">{user.displayName}</p>
              <p className="truncate text-xs text-fog-text">@{user.username}</p>
            </div>
            <button
              type="button"
              onClick={() => logout.mutate()}
              title="Выйти"
              aria-label="Выйти"
              className="press rounded-lg px-2 py-1 text-cloud-text hover:bg-accent hover:text-bone-text"
            >
              ⎋
            </button>
          </div>
        )}
      </aside>

      {/* Контент на всю ширину области; снизу отступ под мобильный bottom-nav. */}
      <main className="min-w-0 flex-1 pb-16 md:pb-0">
        <div className="w-full">{children}</div>
      </main>

      <MobileNav items={items} pathname={pathname} />
    </div>
  );
}
