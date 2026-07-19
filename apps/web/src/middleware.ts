import { NextResponse, type NextRequest } from 'next/server';

const AUTH_PAGES = ['/login', '/register'];
/**
 * Лента, посты и профили открыты гостю на чтение — писать он всё равно не сможет
 * (API отдаёт 401 на мутации). Приватное — личные разделы.
 */
const PROTECTED = ['/messages', '/settings', '/notifications'];

/**
 * Гейтинг по наличию refresh-cookie (zuko_rt). Валидность проверяет API —
 * middleware лишь разводит гостей и залогиненных по маршрутам.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has('zuko_rt');

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    // Куда вернуть после входа — только внутренний путь, чтобы не открыть open redirect.
    url.searchParams.set('next', `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(url);
  }
  if (isAuthPage && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/feed';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/feed/:path*',
    '/messages/:path*',
    '/post/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/notifications/:path*',
    '/login',
    '/register',
  ],
};
