import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { roleCanSeeTab } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';

export default async function UretimPage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (!roleCanSeeTab(session.role, 'uretim')) redirect('/');

  const jobs = await prisma.job.findMany({ where: { stage: { in: ['URETIM', 'MONTAJ'] } }, orderBy: { dueDate: 'asc' } });

  return (
    <div className="shell">
      <Sidebar role={session.role} name={session.name} active="uretim" />
      <div className="content">
        <div className="page-head"><div><div className="page-title">Üretim Programı</div><div className="page-sub">Üretim ve Montaj aşamasındaki işler.</div></div></div>
        <div className="grid">
          {jobs.length === 0 && <div className="note">Şu an programda iş yok.</div>}
          {jobs.map((j) => (
            <div className="card" key={j.id}>
              <div className="stage-badge">{j.stage === 'URETIM' ? 'Üretim' : 'Montaj'}</div>
              <div className="name">{j.client}</div>
              <div className="line">{j.description}</div>
              {j.material && <div className="line">Malzeme: {j.material}</div>}
              {j.dueDate && <div className="line">Teslim: {new Date(j.dueDate).toLocaleDateString('tr-TR')}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
