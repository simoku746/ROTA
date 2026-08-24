import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { ROLE_CONFIG } from '@/lib/roles';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });

  const cfg = ROLE_CONFIG[session.role];
  if (!cfg.canApprove) {
    return NextResponse.json({ error: 'Bu rol onay işlemi yapamaz' }, { status: 403 });
  }

  const { decision } = await req.json(); // 'ONAYLANDI' | 'REVIZYON'
  if (decision !== 'ONAYLANDI' && decision !== 'REVIZYON') {
    return NextResponse.json({ error: 'Geçersiz karar' }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'İş bulunamadı' }, { status: 404 });

  const updated = await prisma.job.update({
    where: { id: params.id },
    data: {
      approval: decision,
      // Onay geldiyse iş otomatik olarak Üretim aşamasına geçer — onay olmadan asla geçmez.
      stage: decision === 'ONAYLANDI' ? 'URETIM' : job.stage,
    },
  });

  return NextResponse.json(updated);
}
