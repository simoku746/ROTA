import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { roleCanSeeTab } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';

export default async function UretimPage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (!roleCanSeeTab(session.role, 'uretim')) redirect('/');

  const jobs = await prisma.job.findMany({
    where: { stage: { in: ['URETIM', 'MONTAJ'] } },
    orderBy: { dueDate: 'asc' },
  });

  return (
    <div>
      <Header role={session.role} name={session.name} active="uretim" />
      <div className="main">
        <div className="note">Bu ekranda sadece Üretim ve Montaj aşamasındaki işler görünür — maliyet/tahsilat bilgisi yok.</div>
        <div className="grid">
          {jobs.length === 0 && <div className="note">Şu an programda iş yok.</div>}
          {jobs.map((j) => (
            <div className="card" key={j.id}>
              <div className="stage-badge">{j.stage === 'URETIM' ? 'Üretim' : 'Montaj'}</div>
              <div className="code">{j.code}</div>
              <div className="client">{j.client}</div>
              <div className="desc">{j.description}</div>
              {j.material && <div className="desc">Malzeme: {j.material}</div>}
              {j.dueDate && <div className="desc">Teslim: {new Date(j.dueDate).toLocaleDateString('tr-TR')}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
