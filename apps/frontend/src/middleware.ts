import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protect dashboard and API routes from unauthenticated access.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/verify-email',
    '/auth/google/success',
  ];
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/api') // frontend api routes if any
  ) {
    return NextResponse.next();
  }

  // Require token for dashboard
  if (pathname.startsWith('/dashboard')) {
    const token = req.cookies.get('accessToken')?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
