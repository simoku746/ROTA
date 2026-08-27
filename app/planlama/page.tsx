import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { ROLE_CONFIG, roleCanSeeTab } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import ApproveButtons from '@/components/ApproveButtons';

const STAGE_LABEL: Record<string, string> = { KESIF: 'Keşif', TASARIM: 'Tasarım', URETIM: 'Üretim', MONTAJ: 'Montaj', TAHSILAT: 'Tahsilat' };
const PAY_LABEL: Record<string, string> = { BEKLIYOR: 'Tahsilat Bekliyor', KISMI: 'Kısmi Ödeme', TAMAMLANDI: 'Tahsil Edildi' };
const APPROVAL_LABEL: Record<string, string> = { BEKLIYOR: 'Onay Bekliyor', ONAYLANDI: 'Onaylandı', REVIZYON: 'Revizyon İstendi' };

export default async function PlanlamaPage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (!roleCanSeeTab(session.role, 'planlama')) redirect('/');

  const cfg = ROLE_CONFIG[session.role];
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="shell">
      <Sidebar role={session.role} name={session.name} active="planlama" />
      <div className="content">
        <div className="page-head">
          <div><div className="page-title">Görev Yönetimi</div><div className="page-sub">{cfg.showCost ? 'Maliyet ve tahsilat bilgisi görünür.' : 'Maliyet ve tahsilat bilgisi bu rolde gizlidir.'}</div></div>
        </div>
        <div className="grid">
          {jobs.map((j) => (
            <div className="card" key={j.id}>
              <div className="stage-badge">{STAGE_LABEL[j.stage]}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{j.code}</div>
              <div className="name">{j.client}</div>
              <div className="line" style={{ marginBottom: 8 }}>{j.description}</div>
              {j.material && <div className="line">Malzeme: {j.material}</div>}
              <div>
                {cfg.showPayment && <span className={`tag pay-${j.payStatus}`}>{PAY_LABEL[j.payStatus]}</span>}
                {j.approval && <span className={`tag appr-${j.approval}`}>{APPROVAL_LABEL[j.approval]}</span>}
                {cfg.showCost && j.cost != null && <span className="tag cost">₺{j.cost.toLocaleString('tr-TR')}</span>}
              </div>
              {j.stage === 'TASARIM' && cfg.canApprove && <ApproveButtons jobId={j.id} />}
              {j.stage === 'TASARIM' && j.approval === 'BEKLIYOR' && <div className="locked">🔒 Onay gelmeden Üretim'e geçemez</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
