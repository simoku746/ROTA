import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { roleCanSeeTab } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import CompleteButton from '@/components/CompleteButton';

export default async function SahaPage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (!roleCanSeeTab(session.role, 'saha')) redirect('/');

  const jobs = await prisma.job.findMany({ where: { stage: 'MONTAJ' }, orderBy: { dueDate: 'asc' } });

  return (
    <div className="shell">
      <Sidebar role={session.role} name={session.name} active="saha" />
      <div className="content">
        <div className="page-head"><div><div className="page-title">Saha (Montaj)</div><div className="page-sub">Sadece size atanmış montaj işleri.</div></div></div>
        {jobs.length === 0 && <div className="note">Şu an atanmış montaj işiniz yok.</div>}
        <div className="grid">
          {jobs.map((j) => (
            <div className="card" key={j.id}>
              <div className="name">{j.client}</div>
              <div className="line">{j.description}</div>
              {j.material && <div className="line">Malzeme: {j.material}</div>}
              {j.dueDate && <div className="line">Tarih: {new Date(j.dueDate).toLocaleDateString('tr-TR')}</div>}
              <CompleteButton jobId={j.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
