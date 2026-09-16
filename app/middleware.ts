import { NextRequest, NextResponse } from 'next/server';

// Oturum çerezi olmayan her istek /login'e gider.
// İstisnalar: /login, /setup (ilk kurulum), /api/auth/*, /api/setup.
//
// (2026-09-16g) ÖNEMLİ: Eskiden burada yalnız çerezin VAR olup olmadığına bakılıyordu.
// Süresi dolmuş bir çerezle /login'e gidildiğinde kullanıcı /'a geri atılıyor, uygulama da
// 401 alıp yeniden /login'e yolluyordu → sonsuz döngü ve giriş formuna hiç ulaşılamıyordu.
// Artık çerezin içindeki bitiş zamanı (exp) da okunuyor; süresi geçmiş çerez "oturum yok"
// sayılıp temizleniyor. İmza doğrulaması burada YAPILMAZ (Edge çalışma ortamı) — yetki
// kararını her zaman sunucu tarafındaki verifySession verir, burada yalnız yönlendirme kararı alınır.
function oturumTazeMi(token?: string) {
  if (!token) return false;
  const govde = token.split('.')[1];
  if (!govde) return false;
  try {
    const json = JSON.parse(atob(govde.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' ? json.exp * 1000 > Date.now() : true;
  } catch {
    return false;
  }
}
function cerezSil(res: NextResponse) {
  res.cookies.set('rota_session', '', { path: '/', maxAge: 0 });
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cerez = req.cookies.get('rota_session')?.value;
  const hasSession = oturumTazeMi(cerez);
  const isLogin = pathname === '/login';
  const isSetup = pathname === '/setup';
  // Şifre sıfırlama TALEBİ bırakmak oturum gerektirmez; listeleme/kapatma (GET/DELETE) yöneticiye özeldir.
  const isSifreIstek = pathname === '/api/sifre-istek' && req.method === 'POST';
  const isPublicApi = pathname.startsWith('/api/auth') || pathname.startsWith('/api/setup') || isSifreIstek;

  // Bayat çerezle giriş/kurulum sayfasına gelindiyse çerezi temizleyip sayfayı göster
  if ((isLogin || isSetup) && cerez && !hasSession) return cerezSil(NextResponse.next());

  if (!hasSession && !isLogin && !isSetup && !isPublicApi) {
    if (pathname.startsWith('/api/')) {
      return cerezSil(NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 }));
    }
    return cerezSil(NextResponse.redirect(new URL('/login', req.url)));
  }
  if (hasSession && (isLogin || isSetup)) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|rota-logo).*)'],
};
