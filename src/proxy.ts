// ============================================================
// VERREX — Combined Proxy (i18n + Auth Protection)
// Next.js 16 uses proxy.ts instead of middleware.ts
// ============================================================

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip ALL API routes entirely (auth, portal register, etc.)
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check if this is a protected dashboard route
  const isDashboardRoute = pathname.includes('/portal/dashboard');

  if (isDashboardRoute) {
    // Check for NextAuth session token
    const token =
      request.cookies.get('authjs.session-token')?.value ||
      request.cookies.get('__Secure-authjs.session-token')?.value;

    if (!token) {
      // Extract locale from pathname
      const localeMatch = pathname.match(/^\/(en|fr)\//);
      const locale = localeMatch ? localeMatch[1] : 'en';
      const loginUrl = new URL(`/${locale}/portal/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply i18n middleware for all routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api/auth (NextAuth routes)
    // - /_next (Next.js internals)
    // - /images, /favicon.ico, etc. (static files)
    '/((?!api|_next|.*\\..*).*)',
  ],
};
