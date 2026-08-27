import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/session';
import { roleCanSeeTab } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import CustomerForm from '@/components/CustomerForm';

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) redirect('/login');
  if (!roleCanSeeTab(session.role, 'kisiler')) redirect('/');

  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) notFound();

  return (
    <div className="shell">
      <Sidebar role={session.role} name={session.name} active="kisiler" />
      <div className="content">
        <div className="page-head"><div><div className="page-title">{customer.type === 'FIRMA' ? 'Firma Düzenle' : 'Şahıs Düzenle'}</div></div></div>
        <CustomerForm type={customer.type as 'FIRMA' | 'SAHIS'} existing={customer} />
      </div>
    </div>
  );
}
