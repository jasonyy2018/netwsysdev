import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'tennishub_session_user_id';

// 必须登录后才能访问的受保护路由前缀
const PROTECTED_PREFIXES = [
  '/my',
  '/match/create',
  '/coach/apply',
  '/assessment/video',
  '/admin',
];

// 已登录状态下无需重复访问的认证路由
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(sessionCookie && sessionCookie.trim() !== '');

  // 1. 已登录用户访问登录或注册页时，自动跳回目标页面或首页
  if (isAuthenticated && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // 2. 未登录用户访问受保护的路由时，重定向到登录页并携带当前路径以便回跳
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isAuthenticated && isProtected) {
    const targetRedirect = encodeURIComponent(`${pathname}${search}`);
    const loginUrl = new URL(`/login?redirect=${targetRedirect}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配除静态资源（_next/static, _next/image, favicon.ico 等）以外的所有请求
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
