import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // المسارات المحمية
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/live');

  if (!isProtected) return NextResponse.next();

  // Firebase Auth بيخزن التوكن في localStorage، لكن نقدر نستخدم كوكيز بسيط
  // (أو نعتمد على وجود أي كوكيز من Firebase)
  const hasAuthCookie = request.cookies.get('__session')?.value;

  if (!hasAuthCookie) {
    // لو مفيش كوكيز، نحول على تسجيل الدخول
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/live/:path*'],
};