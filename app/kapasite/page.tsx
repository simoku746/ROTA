import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { roleCanSeeTab } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';

// Basit bir varsayım: bir ekip/kişi haftada en fazla 5 iş taşıyabilir kabul ediyoruz.
// Gerçek kullanımda bu sayı ekiple birlikte kalibre edilmeli.
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
    <div>
      <Header role={session.role} name={session.name} active="kapasite" />
      <div className="main">
        <div className="note">
          Bu hesap, atanan iş sayısına göre otomatik yapılıyor (varsayım: kişi/ekip başına haftada {CAPACITY_PER_ASSIGNEE} iş kapasitesi). Sayı ekibinizle birlikte kalibre edilmeli.
        </div>
        <div className="grid">
          {rows.length === 0 && <div className="note">Şu an atanmış iş yok.</div>}
          {rows.map((r) => (
            <div className="card" key={r.name}>
              <div className="client">{r.name}</div>
              <div className="desc">{r.count} iş atanmış · %{r.pct} dolu</div>
              <div style={{ background: '#E6E1D2', height: 9, borderRadius: 5, overflow: 'hidden', marginTop: 6 }}>
                <div
                  style={{
                    width: `${r.pct}%`,
                    height: '100%',
                    background: r.pct >= 85 ? '#B4432F' : r.pct >= 65 ? '#E2792A' : '#3F7268',
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
