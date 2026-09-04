import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signSession } from '@/lib/auth';
import { MIN_PASSWORD, fail, isValidEmail, json, normalizeEmail } from '@/lib/api';
import { setSessionCookie } from '@/lib/cookie';

export const dynamic = 'force-dynamic';

/** GET /api/setup → { needsSetup: boolean } (oturum gerekmez) */
export async function GET() {
  const count = await prisma.user.count();
  return json({ needsSetup: count === 0 });
}

/**
 * POST /api/setup { firmaAdi, name, email, password }
 * Yalnızca hiç kullanıcı yokken çalışır: ilk yönetici hesabını, personel kaydını ve
 * boş uygulama verisini oluşturur; oturum açar.
 */
export async function POST(req: NextRequest) {
  const count = await prisma.user.count();
  if (count > 0) return fail('Kurulum zaten yapılmış', 409);

  let body: any;
  try { body = await req.json(); } catch { return fail('Geçersiz istek'); }

  const firmaAdi = String(body?.firmaAdi ?? '').trim();
  const name = String(body?.name ?? '').trim();
  const email = normalizeEmail(body?.email);
  const password = String(body?.password ?? '');

  if (!firmaAdi) return fail('Firma adı gerekli');
  if (!name) return fail('Ad Soyad gerekli');
  if (!isValidEmail(email)) return fail('Geçerli bir e-posta girin');
  if (password.length < MIN_PASSWORD) return fail(`Şifre en az ${MIN_PASSWORD} karakter olmalı`);

  const user = await prisma.user.create({
    data: { email, name, role: 'YONETICI', passwordHash: await hashPassword(password) },
  });

  // Prototipin beklediği biçimde ilk personel (yönetici) kaydı
  const personel = {
    id: 'p' + Date.now(),
    name,
    unvan: 'Yönetici',
    departman: 'Keşif',
    brut: 0,
    arsiv: false,
    kullanici: { email, rol: 'YONETICI' },
    cinsiyet: '',
    dogumTarihi: '',
    dogumYeri: '',
    iletisim: [{ tur: 'Cep Telefonu', deger: '' }],
    adres: { tur: 'İş Adresi', ulke: 'Türkiye', postaKodu: '', ilce: '', sehir: '', eyalet: '', adres: '' },
    hareketler: [],
  };

  const existing = await prisma.appState.findUnique({ where: { id: 'main' } });
  if (!existing) {
    await prisma.appState.create({
      data: {
        id: 'main',
        version: 1,
        updatedBy: email,
        data: { PERSONELLER: [personel], AGENCY: { name: firmaAdi } },
      },
    });
  }

  const token = signSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  return setSessionCookie(json({ ok: true }, 201), token);
}
