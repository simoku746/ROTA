import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  const data = await req.json();
  if (!data.name) return NextResponse.json({ error: 'İsim gerekli' }, { status: 400 });
  const customer = await prisma.customer.create({ data });
  return NextResponse.json(customer);
}
