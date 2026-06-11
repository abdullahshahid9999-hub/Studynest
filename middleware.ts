import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next();
  if (pathname === '/login') return NextResponse.next();

  // Check for any supabase auth cookie
  const cookies = request.cookies.getAll();
  const hasAuth = cookies.some(c => 
    c.name.startsWith('sb-') || 
    c.name.includes('supabase') ||
    c.name.includes('auth-token')
  );

  if (!hasAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
