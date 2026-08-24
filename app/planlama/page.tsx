import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { ROLE_CONFIG, roleCanSeeTab } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import ApproveButtons from '@/components/ApproveButtons';

const STAGE_LABEL: Record<string, string> = {
  KESIF: 'Keşif', TASARIM: 'Tasarım', URETIM: 'Üretim', MONTAJ: 'Montaj', TAHSILAT: 'Tahsilat',
};
const PAY_LABEL: Record<string, string> = { BEKLIYOR: 'Tahsilat Bekliyor', KISMI: 'Kısmi Ödeme', TAMAMLANDI: 'Tahsil Edildi' };
const APPROVAL_LABEL: Record<string, string> = { BEKLIYOR: 'Onay Bekliyor', ONAYLANDI: 'Onaylandı', REVIZYON: 'Revizyon İstendi' };

export default async function PlanlamaPage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (!roleCanSeeTab(session.role, 'planlama')) redirect('/');

  const cfg = ROLE_CONFIG[session.role];
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <Header role={session.role} name={session.name} active="planlama" />
      <div className="main">
        <div className="note">
          Bu ekranda tüm işler görünür. <b>{cfg.label}</b> rolü {cfg.showCost ? 'maliyet ve tahsilat bilgisini görüyor.' : 'maliyet ve tahsilat bilgisini görmüyor.'}
        </div>
        <div className="grid">
          {jobs.map((j) => (
            <div className="card" key={j.id}>
              <div className="stage-badge">{STAGE_LABEL[j.stage]}</div>
              <div className="code">{j.code}</div>
              <div className="client">{j.client}</div>
              <div className="desc">{j.description}</div>
              {j.material && <div className="desc">Malzeme: {j.material}</div>}
              <div>
                {cfg.showPayment && (
                  <span className={`tag pay-${j.payStatus}`}>{PAY_LABEL[j.payStatus]}</span>
                )}
                {j.approval && (
                  <span className={`tag appr-${j.approval}`}>{APPROVAL_LABEL[j.approval]}</span>
                )}
                {cfg.showCost && j.cost != null && (
                  <span className="tag cost">₺{j.cost.toLocaleString('tr-TR')}</span>
                )}
              </div>
              {j.stage === 'TASARIM' && cfg.canApprove && <ApproveButtons jobId={j.id} />}
              {j.stage === 'TASARIM' && j.approval === 'BEKLIYOR' && (
                <div className="locked">🔒 Onay gelmeden Üretim'e geçemez</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
