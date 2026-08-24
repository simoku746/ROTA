'use client';
import { useRouter } from 'next/navigation';
import { RoleKey, ROLE_CONFIG } from '@/lib/roles';

const TAB_LABELS: Record<string, string> = {
  planlama: 'Planlama',
  kapasite: 'Kapasite',
  uretim: 'Üretim Programı',
  saha: 'Saha (Montaj)',
};

export default function Header({ role, name, active }: { role: RoleKey; name: string; active: string }) {
  const router = useRouter();
  const cfg = ROLE_CONFIG[role];

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div className="brand"><span className="dot" />ROTA</div>
        <div className="nav">
          {cfg.tabs.map((t) => (
            <a key={t} href={`/${t}`} className={active === t ? 'active' : ''}>
              {TAB_LABELS[t]}
            </a>
          ))}
        </div>
      </div>
      <div className="userbox">
        <span>{name} · {cfg.label}</span>
        <button className="logout-btn" onClick={logout}>Çıkış</button>
      </div>
    </div>
  );
}
