import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { fail, json } from '@/lib/api';
import { clearSessionCookie } from '@/lib/cookie';

export const dynamic = 'force-dynamic';

// Oturumdaki kullanıcıyı verir. Kullanıcı silinmişse çerezi temizler (401).
export async function GET() {
  const s = getSession();
  if (!s) return fail('Oturum bulunamadı', 401);
  const user = await prisma.user.findUnique({ where: { id: s.id }, select: { id: true, email: true, name: true, role: true } });
  if (!user) return clearSessionCookie(fail('Kullanıcı bulunamadı', 401));
  return json(user);
}
