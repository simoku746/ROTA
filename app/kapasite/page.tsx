import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { roleCanSeeTab } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';

const CAPACITY_PER_ASSIGNEE = 5;

export default async function KapasitePage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (!roleCanSeeTab(session.role, 'kapasite')) redirect('/');

  const jobs = await prisma.job.findMany({
    where: { stage: { in: ['URETIM', 'MONTAJ'] }, assignee: { not: null } },
  });

  const counts: Record<string, number> = {};
  jobs.forEach((j) => {
    if (!j.assignee) return;
    counts[j.assignee] = (counts[j.assignee] || 0) + 1;
  });

  const rows = Object.entries(counts).map(([name, count]) => ({
    name,
    count,
    pct: Math.min(100, Math.round((count / CAPACITY_PER_ASSIGNEE) * 100)),
  }));

  return (
    <div className="shell">
      <Sidebar role={session.role} name={session.name} active="kapasite" />
      <div className="content">
        <div className="page-head">
          <h1 className="page-title">Kapasite</h1>
          <p className="page-sub">Atanan iş sayısına göre otomatik hesaplanan doluluk oranı.</p>
        </div>
        <div className="note">Varsayım: kişi/ekip başına haftada {CAPACITY_PER_ASSIGNEE} iş kapasitesi. Ekibinizle birlikte kalibre edin.</div>
        <div className="grid">
          {rows.length === 0 && <div className="note">Şu an atanmış iş yok.</div>}
          {rows.map((r) => (
            <div className="card" key={r.name}>
              <div className="client">{r.name}</div>
              <div className="desc">{r.count} iş atanmış · %{r.pct} dolu</div>
              <div style={{ background: '#F0F0F5', height: 9, borderRadius: 5, overflow: 'hidden', marginTop: 8 }}>
                <div
                  style={{
                    width: `${r.pct}%`,
                    height: '100%',
                    borderRadius: 5,
                    background: r.pct >= 85 ? '#FF6A55' : r.pct >= 65 ? '#FFA53E' : '#2ED47A',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
