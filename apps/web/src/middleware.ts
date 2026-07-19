import { NextResponse, type NextRequest } from 'next/server';

const AUTH_PAGES = ['/login', '/register'];
const PROTECTED = ['/feed', '/messages', '/post', '/profile', '/settings', '/notifications'];

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
    return NextResponse.redirect(url);
  }
  if (isAuthPage && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/feed';
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
