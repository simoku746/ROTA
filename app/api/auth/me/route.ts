import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { fail, json } from '@/lib/api';
import { clearSessionCookie } from '@/lib/cookie';

export const dynamic = 'force-dynamic';

// Oturumdaki kullanıcıyı verir. Kullanıcı silinmişse çerezi temizler (401).
export async function GET() {
  const s = getSession();
  // (2026-09-16g) Geçersiz/süresi dolmuş çerez de temizlenir — aksi hâlde tarayıcıda kalan bayat
  // çerez, ara katmanla birlikte /login ↔ / arasında sonsuz yönlendirme döngüsü oluşturuyordu.
  if (!s) return clearSessionCookie(fail('Oturum bulunamadı', 401));
  const user = await prisma.user.findUnique({ where: { id: s.id }, select: { id: true, email: true, name: true, role: true } });
  if (!user) return clearSessionCookie(fail('Kullanıcı bulunamadı', 401));
  return json(user);
}
