import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });

  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'İş bulunamadı' }, { status: 404 });
  if (job.stage !== 'MONTAJ') {
    return NextResponse.json({ error: 'Bu iş montaj aşamasında değil' }, { status: 400 });
  }

  const updated = await prisma.job.update({
    where: { id: params.id },
    data: { stage: 'TAHSILAT' },
  });

  return NextResponse.json(updated);
}
