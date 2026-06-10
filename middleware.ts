import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();
  if (pathname === '/login') return NextResponse.next();

  // Check for Supabase auth cookies
  const hasAuth = request.cookies.getAll().some(c => 
    c.name.includes('supabase') || c.name.includes('sb-')
  );

  if (!hasAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
