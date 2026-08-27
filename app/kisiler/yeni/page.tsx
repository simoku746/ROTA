import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { roleCanSeeTab } from '@/lib/roles';
import Sidebar from '@/components/Sidebar';
import NewCustomerClient from '@/components/NewCustomerClient';

export default async function YeniKisiPage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (!roleCanSeeTab(session.role, 'kisiler')) redirect('/');

  return (
    <div className="shell">
      <Sidebar role={session.role} name={session.name} active="kisiler" />
      <div className="content">
        <NewCustomerClient />
      </div>
    </div>
  );
}
