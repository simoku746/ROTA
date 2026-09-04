import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { isRole } from '@/lib/roles';
import { MIN_PASSWORD, fail, isValidEmail, json, normalizeEmail, requireAdmin, requireSession } from '@/lib/api';

export const dynamic = 'force-dynamic';

const SAFE = { id: true, email: true, name: true, role: true, createdAt: true } as const;

async function readBody(req: NextRequest) {
  try { return await req.json(); } catch { return null; }
}

/** GET /api/users → giriş hesapları listesi (yönetici) */
export async function GET() {
  const auth = requireAdmin();
  if ('res' in auth) return auth.res;
  const users = await prisma.user.findMany({ select: SAFE, orderBy: { createdAt: 'asc' } });
  return json(users);
}

/** POST /api/users { email, name, password, role } → yeni giriş hesabı (yönetici) */
export async function POST(req: NextRequest) {
  const auth = requireAdmin();
  if ('res' in auth) return auth.res;
  const body = await readBody(req);
  if (!body) return fail('Geçersiz istek');

  const email = normalizeEmail(body.email);
  const name = String(body.name ?? '').trim();
  const password = String(body.password ?? '');
  const role = body.role;

  if (!isValidEmail(email)) return fail('Geçerli bir e-posta girin');
  if (!name) return fail('Ad gerekli');
  if (password.length < MIN_PASSWORD) return fail(`Şifre en az ${MIN_PASSWORD} karakter olmalı`);
  if (!isRole(role)) return fail('Geçersiz rol');

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return fail('Bu e-posta ile bir hesap zaten var', 409);

  const user = await prisma.user.create({
    data: { email, name, role, passwordHash: await hashPassword(password) },
    select: SAFE,
  });
  return json(user, 201);
}

/**
 * PATCH /api/users { email, password?, name?, role? }
 * Yönetici herkesi güncelleyebilir; kullanıcı yalnızca kendi şifresini değiştirebilir.
 */
export async function PATCH(req: NextRequest) {
  const auth = requireSession();
  if ('res' in auth) return auth.res;
  const body = await readBody(req);
  if (!body) return fail('Geçersiz istek');

  const email = normalizeEmail(body.email) || auth.user.email;
  const isAdmin = auth.user.role === 'YONETICI';
  const isSelf = email === auth.user.email;
  if (!isAdmin && !isSelf) return fail('Yetkiniz yok', 403);

  const target = await prisma.user.findUnique({ where: { email } });
  if (!target) return fail('Kullanıcı bulunamadı', 404);

  const data: { passwordHash?: string; name?: string; role?: any } = {};
  if (body.password !== undefined) {
    const password = String(body.password ?? '');
    if (password.length < MIN_PASSWORD) return fail(`Şifre en az ${MIN_PASSWORD} karakter olmalı`);
    data.passwordHash = await hashPassword(password);
  }
  if (isAdmin && body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return fail('Ad boş olamaz');
    data.name = name;
  }
  if (isAdmin && body.role !== undefined) {
    if (!isRole(body.role)) return fail('Geçersiz rol');
    if (target.role === 'YONETICI' && body.role !== 'YONETICI') {
      const admins = await prisma.user.count({ where: { role: 'YONETICI' } });
      if (admins <= 1) return fail('Son yönetici hesabının rolü değiştirilemez');
    }
    data.role = body.role;
  }
  if (Object.keys(data).length === 0) return fail('Değiştirilecek alan yok');

  const user = await prisma.user.update({ where: { email }, data, select: SAFE });
  return json(user);
}

/** DELETE /api/users { email } → hesabı kaldır (yönetici; son yönetici korunur) */
export async function DELETE(req: NextRequest) {
  const auth = requireAdmin();
  if ('res' in auth) return auth.res;
  const body = await readBody(req);
  const email = normalizeEmail(body?.email ?? req.nextUrl.searchParams.get('email'));
  if (!email) return fail('E-posta gerekli');

  const target = await prisma.user.findUnique({ where: { email } });
  if (!target) return fail('Kullanıcı bulunamadı', 404);
  if (target.role === 'YONETICI') {
    const admins = await prisma.user.count({ where: { role: 'YONETICI' } });
    if (admins <= 1) return fail('Son yönetici hesabı kaldırılamaz');
  }
  await prisma.user.delete({ where: { email } });
  return json({ ok: true, self: target.id === auth.user.id });
}
