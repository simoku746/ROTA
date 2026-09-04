import { NextRequest, NextResponse } from 'next/server';

// Oturum çerezi olmayan her istek /login'e gider.
// İstisnalar: /login, /setup (ilk kurulum), /api/auth/*, /api/setup.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get('rota_session')?.value);
  const isLogin = pathname === '/login';
  const isSetup = pathname === '/setup';
  const isPublicApi = pathname.startsWith('/api/auth') || pathname.startsWith('/api/setup');

  if (!hasSession && !isLogin && !isSetup && !isPublicApi) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (hasSession && (isLogin || isSetup)) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|rota-logo).*)'],
};
