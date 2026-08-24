import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { roleCanSeeTab } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import CompleteButton from '@/components/CompleteButton';

export default async function SahaPage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (!roleCanSeeTab(session.role, 'saha')) redirect('/');

  const jobs = await prisma.job.findMany({ where: { stage: 'MONTAJ' }, orderBy: { dueDate: 'asc' } });

  return (
    <div>
      <Header role={session.role} name={session.name} active="saha" />
      <div className="main">
        <div className="note">Sadece size atanmış montaj işleri burada görünür.</div>
        {jobs.length === 0 && <div className="note">Şu an atanmış montaj işiniz yok.</div>}
        <div className="grid">
          {jobs.map((j) => (
            <div className="card" key={j.id}>
              <div className="client">{j.client}</div>
              <div className="desc">{j.description}</div>
              {j.material && <div className="desc">Malzeme: {j.material}</div>}
              {j.dueDate && <div className="desc">Tarih: {new Date(j.dueDate).toLocaleDateString('tr-TR')}</div>}
              <CompleteButton jobId={j.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
