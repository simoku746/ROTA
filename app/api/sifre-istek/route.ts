import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, json, normalizeEmail, requireAdmin } from '@/lib/api';

export const dynamic = 'force-dynamic';

/**
 * ŞİFRE SIFIRLAMA TALEPLERİ (yönetici onaylı akış — e-posta servisi gerektirmez)
 *
 * Kullanıcı giriş ekranındaki "Şifremi unuttum" ile talep bırakır (POST, oturum gerekmez).
 * Yönetici ROTA içinde talebi görür ve mevcut "Şifre" ekranından yeni şifreyi belirler.
 *
 * NEREDE SAKLANIR: AppState tablosunda AYRI bir satır (id = 'sifre_istekleri').
 * Uygulama verisi 'main' satırındadır; ayrı satır kullanmak (a) şema göçü gerektirmez,
 * (b) uygulamanın sürüm sayacına dokunmadığı için açık duran sekmelerde 409 çakışması yaratmaz.
 */
const ISTEK_ID = 'sifre_istekleri';
const TAVAN = 50;                    // en fazla bu kadar talep saklanır
const TEKRAR_DK = 30;                // aynı e-posta için bu süre içinde ikinci kayıt açılmaz

type Istek = { id: string; email: string; ad: string; tarih: string };

async function istekleriOku(): Promise<Istek[]> {
  const row = await prisma.appState.findUnique({ where: { id: ISTEK_ID } });
  const d: any = row?.data;
  return Array.isArray(d?.liste) ? (d.liste as Istek[]) : [];
}
async function istekleriYaz(liste: Istek[]) {
  const data = { liste: liste.slice(-TAVAN) };
  await prisma.appState.upsert({
    where: { id: ISTEK_ID },
    update: { data },
    create: { id: ISTEK_ID, data, version: 1 },
  });
}

/** POST /api/sifre-istek { email } → talep bırakır (oturum GEREKMEZ) */
export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return fail('Geçersiz istek'); }
  const email = normalizeEmail(body?.email);
  // Yanıt her durumda aynıdır: hesabın var olup olmadığı dışarıya sızdırılmaz.
  const yanit = json({ ok: true });
  if (!email) return yanit;

  const user = await prisma.user.findUnique({ where: { email }, select: { email: true, name: true } });
  if (!user) return yanit;

  const liste = await istekleriOku();
  const esik = Date.now() - TEKRAR_DK * 60 * 1000;
  const zatenVar = liste.some(x => x.email === email && new Date(x.tarih).getTime() > esik);
  if (zatenVar) return yanit;

  liste.push({
    id: 'si' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    email: user.email,
    ad: user.name,
    tarih: new Date().toISOString(),
  });
  await istekleriYaz(liste);
  return yanit;
}

/** GET /api/sifre-istek → bekleyen talepler (yalnız yönetici) */
export async function GET() {
  const auth = requireAdmin();
  if ('res' in auth) return auth.res;
  return json({ liste: await istekleriOku() });
}

/** DELETE /api/sifre-istek { id? , email?, hepsi? } → talebi kapatır (yalnız yönetici) */
export async function DELETE(req: NextRequest) {
  const auth = requireAdmin();
  if ('res' in auth) return auth.res;
  let body: any = null;
  try { body = await req.json(); } catch { body = null; }

  const liste = await istekleriOku();
  let kalan: Istek[];
  if (body?.hepsi) kalan = [];
  else if (body?.id) kalan = liste.filter(x => x.id !== body.id);
  else if (body?.email) { const e = normalizeEmail(body.email); kalan = liste.filter(x => x.email !== e); }
  else return fail('Kapatılacak talep belirtilmedi');

  await istekleriYaz(kalan);
  return json({ ok: true, liste: kalan });
}
