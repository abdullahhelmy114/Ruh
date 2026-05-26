import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // يطابق جميع المسارات ماعدا تلك التي تبدأ بـ api, _next, _vercel, _not-found, static
    // والملفات ذات الامتدادات
    '/((?!api|_next|_vercel|_not-found|static|.*\\..*).*)',
    // يطابق المسارات التي تبدأ بأحد اللغات الثلاث
    '/(ar|en|tr)/:path*',
  ],
};