'use client';
import { useRouter } from 'next/navigation';
import { RoleKey, ROLE_CONFIG, TAB_LABELS, TAB_ICONS, TAB_COLORS } from '@/lib/roles';

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export default function Sidebar({ role, name, active }: { role: RoleKey; name: string; active: string }) {
  const router = useRouter();
  const cfg = ROLE_CONFIG[role];

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="sidebar">
      <div className="brand">
        <div className="brand-left"><span className="brand-logo">🧭</span>ROTA</div>
      </div>
      <div className="nav">
        {cfg.tabs.map((t) => (
          <a key={t} href={`/${t}`} className={active === t ? 'active' : ''}>
            <span className="nav-item-icon" style={{ background: TAB_COLORS[t] }}>{TAB_ICONS[t]}</span>
            {TAB_LABELS[t]}
          </a>
        ))}
      </div>
      <div className="sidebar-foot">
        <div className="sidebar-user">
          <div className="avatar">{initials(name)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{name}</div>
            <div className="sidebar-user-role">{cfg.label}</div>
          </div>
        </div>
        <button className="logout-link" onClick={logout}>Çıkış Yap</button>
      </div>
    </div>
  );
}
