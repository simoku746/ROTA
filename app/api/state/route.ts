import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { fail, json, requireSession } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const STATE_ID = 'main';
// Vercel fonksiyon gövdesi sınırı ~4.5 MB; güvenli tarafta kalıyoruz.
const MAX_BYTES = 3_500_000;

/**
 * GET /api/state           → { version, data, updatedAt, updatedBy }
 * GET /api/state?v=12      → sürüm 12 ise { version:12, unchanged:true }, değilse tam veri
 */
export async function GET(req: NextRequest) {
  const auth = requireSession();
  if ('res' in auth) return auth.res;

  const row = await prisma.appState.findUnique({ where: { id: STATE_ID } });
  if (!row) return json({ version: 0, data: null, updatedAt: null, updatedBy: null });

  const known = Number(req.nextUrl.searchParams.get('v'));
  if (Number.isFinite(known) && known === row.version) {
    return json({ version: row.version, unchanged: true });
  }
  return json({ version: row.version, data: row.data, updatedAt: row.updatedAt, updatedBy: row.updatedBy });
}

/**
 * PUT/POST /api/state  gövde: { version:<bilinen sürüm>, data:{...} }
 * Bilinen sürüm sunucudakiyle eşleşmiyorsa 409 + güncel sürüm döner.
 * (POST, sayfa kapanırken sendBeacon ile gönderim için.)
 */
async function save(req: NextRequest) {
  const auth = requireSession();
  if ('res' in auth) return auth.res;

  const raw = await req.text();
  if (raw.length > MAX_BYTES) return fail('Veri çok büyük (' + Math.round(raw.length / 1024) + ' KB)', 413);

  let body: any;
  try { body = JSON.parse(raw); } catch { return fail('Geçersiz JSON'); }
  const data = body?.data;
  const version = Number(body?.version);
  if (!data || typeof data !== 'object' || Array.isArray(data)) return fail('data nesnesi gerekli');
  if (!Number.isFinite(version)) return fail('version gerekli');

  const current = await prisma.appState.findUnique({ where: { id: STATE_ID }, select: { version: true } });
  const serverVersion = current?.version ?? 0;
  if (serverVersion !== version) {
    return json({ error: 'Sürüm çakışması', version: serverVersion }, 409);
  }

  const next = serverVersion + 1;
  const payload = data as Prisma.InputJsonValue;
  let row;
  if (current) {
    // updateMany + version koşulu: iki eşzamanlı kayıt da aynı sürümü görürse yalnızca biri yazar.
    const r = await prisma.appState.updateMany({
      where: { id: STATE_ID, version: serverVersion },
      data: { data: payload, version: next, updatedBy: auth.user.email },
    });
    if (r.count === 0) {
      const fresh = await prisma.appState.findUnique({ where: { id: STATE_ID }, select: { version: true } });
      return json({ error: 'Sürüm çakışması', version: fresh?.version ?? 0 }, 409);
    }
    row = { version: next };
  } else {
    row = await prisma.appState.create({
      data: { id: STATE_ID, data: payload, version: next, updatedBy: auth.user.email },
      select: { version: true },
    });
  }
  return json({ ok: true, version: row.version });
}

export async function PUT(req: NextRequest) { return save(req); }
export async function POST(req: NextRequest) { return save(req); }
