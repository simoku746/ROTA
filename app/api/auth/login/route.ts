import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPassword, signSession } from '@/lib/auth';
import { fail, json, normalizeEmail } from '@/lib/api';
import { setSessionCookie } from '@/lib/cookie';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return fail('Geçersiz istek'); }
  const email = normalizeEmail(body?.email);
  const password = String(body?.password ?? '');
  if (!email || !password) return fail('E-posta ve şifre gerekli');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return fail('E-posta veya şifre hatalı', 401);

  const valid = await checkPassword(password, user.passwordHash);
  if (!valid) return fail('E-posta veya şifre hatalı', 401);

  const token = signSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  return setSessionCookie(json({ ok: true, role: user.role }), token);
}
