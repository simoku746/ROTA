import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get('rota_session')?.value);
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  const isAuthApi = req.nextUrl.pathname.startsWith('/api/auth');

  if (!hasSession && !isAuthPage && !isAuthApi) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
