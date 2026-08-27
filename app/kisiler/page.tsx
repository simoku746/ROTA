import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { roleCanSeeTab } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';

export default async function KisilerPage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (!roleCanSeeTab(session.role, 'kisiler')) redirect('/');

  const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="shell">
      <Sidebar role={session.role} name={session.name} active="kisiler" />
      <div className="content">
        <div className="list-page-head">
          <div>
            <div className="page-title">Kişiler</div>
            <div className="page-sub">Bir karta tıklayarak düzenleyebilirsiniz.</div>
          </div>
          <a className="primary-btn" href="/kisiler/yeni">+ Yeni</a>
        </div>
        <div className="grid">
          {customers.map((c) => (
            <a className="card" key={c.id} href={`/kisiler/${c.id}`} style={{ cursor: 'pointer' }}>
              <div className="name">{c.name}</div>
              {c.contact && <div className="line">👤 {c.contact}</div>}
              {c.phone && <div className="line">📞 {c.phone}</div>}
              {c.email && <div className="line">✉️ {c.email}</div>}
              {c.address && <div className="line">📍 {c.address}</div>}
            </a>
          ))}
          {customers.length === 0 && <div className="note">Henüz kişi eklenmedi.</div>}
        </div>
      </div>
    </div>
  );
}
