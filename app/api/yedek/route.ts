import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, json, normalizeEmail, requireAdmin } from '@/lib/api';

export const dynamic = 'force-dynamic';

/**
 * TAM YEDEK (yalnız yönetici)
 *
 * GET  /api/yedek → { surum, tarih, version, state, users }  — tek dosyada her şey
 * PUT  /api/yedek → aynı biçimdeki dosyayı geri yükler
 *
 * NEDEN: Uygulama verisi AppState'te, giriş hesapları User tablosunda durur; ikisi ayrı yerdedir.
 * Gerçek bir felaket kurtarma için ikisi birlikte alınmalı. 16 Eylül 2026'da veritabanı kotası
 * dolup erişim kesildiğinde elde hiçbir kopya olmadığı görüldü; bu uç nokta o eksiği kapatır.
 *
 * GÜVENLİK: Yedek dosyası şifre ÖZETLERİNİ (bcrypt hash) içerir — düz şifre değildir, geri
 * çevrilemez; ama yine de dosya gizli tutulmalıdır. Uç nokta yalnız yöneticiye açıktır.
 */
const STATE_ID = 'main';
const YEDEK_SURUM = 1;

export async function GET() {
  const auth = requireAdmin();
  if ('res' in auth) return auth.res;

  const row = await prisma.appState.findUnique({ where: { id: STATE_ID } });
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, passwordHash: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return json({
    yedekSurum: YEDEK_SURUM,
    tarih: new Date().toISOString(),
    alan: auth.user.email,
    version: row?.version ?? 0,
    state: row?.data ?? null,
    users,
  });
}

/**
 * PUT /api/yedek  gövde: GET'in döndürdüğü dosyanın aynısı
 * { state, users?, kullanicilariDaYukle?: boolean }
 * Uygulama verisini geri yazar; istenirse giriş hesaplarını da geri kurar (var olanı günceller,
 * olmayanı ekler — hiçbir hesap SİLİNMEZ, böylece geri yükleyen kendi hesabını kaybetmez).
 */
export async function PUT(req: NextRequest) {
  const auth = requireAdmin();
  if ('res' in auth) return auth.res;

  let body: any;
  try { body = await req.json(); } catch { return fail('Dosya okunamadı — geçerli bir yedek dosyası seçin'); }
  if (!body || typeof body !== 'object') return fail('Geçersiz yedek dosyası');
  if (!body.state || typeof body.state !== 'object') return fail('Yedek dosyasında uygulama verisi (state) yok');

  const mevcut = await prisma.appState.findUnique({ where: { id: STATE_ID }, select: { version: true } });
  const yeniVersion = (mevcut?.version ?? 0) + 1;
  await prisma.appState.upsert({
    where: { id: STATE_ID },
    update: { data: body.state, version: yeniVersion, updatedBy: auth.user.email + ' (yedekten geri yükleme)' },
    create: { id: STATE_ID, data: body.state, version: yeniVersion, updatedBy: auth.user.email + ' (yedekten geri yükleme)' },
  });

  let eklenen = 0, guncellenen = 0;
  if (body.kullanicilariDaYukle && Array.isArray(body.users)) {
    for (const u of body.users) {
      const email = normalizeEmail(u?.email);
      if (!email || !u?.passwordHash || !u?.name || !u?.role) continue;
      const var_ = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (var_) {
        await prisma.user.update({ where: { email }, data: { name: u.name, role: u.role, passwordHash: u.passwordHash } });
        guncellenen++;
      } else {
        await prisma.user.create({ data: { email, name: u.name, role: u.role, passwordHash: u.passwordHash } });
        eklenen++;
      }
    }
  }

  return json({ ok: true, version: yeniVersion, eklenen, guncellenen });
}
