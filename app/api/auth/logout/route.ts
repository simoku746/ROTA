import { json } from '@/lib/api';
import { clearSessionCookie } from '@/lib/cookie';

export const dynamic = 'force-dynamic';

export async function POST() {
  return clearSessionCookie(json({ ok: true }));
}
