import { NextResponse } from 'next/server';
import { getSession } from './session';
import type { SessionUser } from './auth';

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Oturum yoksa 401 döner; varsa kullanıcıyı verir. */
export function requireSession(): { user: SessionUser } | { res: NextResponse } {
  const user = getSession();
  if (!user) return { res: fail('Oturum bulunamadı', 401) };
  return { user };
}

export function requireAdmin(): { user: SessionUser } | { res: NextResponse } {
  const r = requireSession();
  if ('res' in r) return r;
  if (r.user.role !== 'YONETICI') return { res: fail('Bu işlem için yönetici yetkisi gerekir', 403) };
  return r;
}

export function normalizeEmail(v: unknown) {
  return String(v ?? '').trim().toLowerCase();
}

export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export const MIN_PASSWORD = 6;
