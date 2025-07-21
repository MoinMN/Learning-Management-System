import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Publicly accessible pages (for unauthenticated users)
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/seller/register',
  '/forgot-password',
  '/reset-password',
];

// Mapping of roles to their allowed path prefix
const ROLE_PATH_PREFIX = {
  VIEWER: '/veiwer',
  SELLER: '/seller',
  ADMIN: '/admin',
};

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. Allow public routes without auth
  const isPublic = PUBLIC_ROUTES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublic) {
    // If already authenticated, redirect away from public pages
    if (token) {
      const dashboardPaths = {
        VIEWER: '/viewer/dashboard',
        SELLER: '/seller/dashboard',
        ADMIN: '/admin/dashboard',
      };
      const redirectPath = dashboardPaths[token?.role] || '/';
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
    return NextResponse.next();
  }

  // 2. Block unauthenticated users from any role-protected path
  const isRolePath = Object.values(ROLE_PATH_PREFIX).some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!token && isRolePath) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 3. Authenticated user: check if trying to access unauthorized role path
  if (token && isRolePath) {
    const userRole = token.role?.toUpperCase();
    const allowedPrefix = ROLE_PATH_PREFIX[userRole];

    if (!pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico).*)', // Apply to all pages except static assets
  ],
};
