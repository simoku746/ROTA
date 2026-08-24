import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { ROLE_CONFIG, roleCanSeeTab } from '@/lib/roles';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import ApproveButtons from '@/components/ApproveButtons';

const STAGES: { key: string; label: string }[] = [
  { key: 'KESIF', label: 'Keşif' },
  { key: 'TASARIM', label: 'Tasarım' },
  { key: 'URETIM', label: 'Üretim' },
  { key: 'MONTAJ', label: 'Montaj' },
  { key: 'TAHSILAT', label: 'Tahsilat' },
];
const PAY_LABEL: Record<string, string> = { BEKLIYOR: 'Tahsilat Bekliyor', KISMI: 'Kısmi Ödeme', TAMAMLANDI: 'Tahsil Edildi' };
const APPROVAL_LABEL: Record<string, string> = { BEKLIYOR: 'Onay Bekliyor', ONAYLANDI: 'Onaylandı', REVIZYON: 'Revizyon İstendi' };

function initials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

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
          <h1 className="page-title">Planlama Panosu</h1>
          <p className="page-sub">Tüm işler aşama aşama burada. {cfg.showCost ? 'Maliyet ve tahsilat bilgisi görünür.' : 'Maliyet ve tahsilat bilgisi bu rolde gizlidir.'}</p>
        </div>

        <div className="board">
          {STAGES.map((stage) => {
            const stageJobs = jobs.filter((j) => j.stage === stage.key);
            return (
              <div className="board-col" key={stage.key}>
                <div className="board-col-head">
                  <span className="board-col-title">{stage.label}</span>
                  <span className="board-col-count">{stageJobs.length}</span>
                </div>
                {stageJobs.map((j) => (
                  <div className="kcard" key={j.id}>
                    <div className="code">{j.code}</div>
                    <div className="client">{j.client}</div>
                    <div className="desc">{j.description}</div>
                    <div>
                      {cfg.showPayment && <span className={`chip chip-pay-${j.payStatus}`}>{PAY_LABEL[j.payStatus]}</span>}
                      {j.approval && <span className={`chip chip-appr-${j.approval}`}>{APPROVAL_LABEL[j.approval]}</span>}
                      {cfg.showCost && j.cost != null && <span className="chip chip-cost">₺{j.cost.toLocaleString('tr-TR')}</span>}
                    </div>
                    <div className="meta-row">
                      <span className="due">{j.dueDate ? new Date(j.dueDate).toLocaleDateString('tr-TR') : ''}</span>
                      <span className="mini-avatar">{initials(j.assignee)}</span>
                    </div>
                    {j.stage === 'TASARIM' && cfg.canApprove && <ApproveButtons jobId={j.id} />}
                    {j.stage === 'TASARIM' && j.approval === 'BEKLIYOR' && (
                      <div className="locked">🔒 Onay gelmeden Üretim'e geçemez</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
