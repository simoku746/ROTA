'use client';
import { useEffect, useState } from 'react';

export default function SetupPage() {
  const [ready, setReady] = useState(false);
  const [firmaAdi, setFirmaAdi] = useState('Dekant Endüstriyel Reklam');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Kurulum zaten yapılmışsa buranın işi yok.
  useEffect(() => {
    fetch('/api/setup', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && !d.needsSetup) window.location.replace('/login'); else setReady(true); })
      .catch(() => setReady(true));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== password2) { setError('Şifreler aynı değil'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firmaAdi, name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Kurulum başarısız');
        setLoading(false);
        return;
      }
      window.location.href = '/';
    } catch {
      setError('Sunucuya ulaşılamadı');
      setLoading(false);
    }
  }

  if (!ready) return <div className="auth-wrap"><div className="auth-sub">Kontrol ediliyor…</div></div>;

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-brand"><span className="auth-logo">R</span>ROTA</div>
        <p className="auth-sub">İlk kurulum — bu ekran yalnızca bir kez görünür.</p>
        <form onSubmit={handleSubmit}>
          <div className="auth-step">Firma</div>
          <div className="field">
            <label>Firma adı</label>
            <input value={firmaAdi} onChange={(e) => setFirmaAdi(e.target.value)} required />
            <small>Adres, telefon ve banka bilgilerini içeride Yönetim → Firma Bilgileri'nden düzenlersiniz.</small>
          </div>

          <div className="auth-step">Yönetici hesabı</div>
          <div className="field">
            <label>Ad Soyad</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>E-posta</label>
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Şifre</label>
            <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <small>En az 6 karakter.</small>
          </div>
          <div className="field">
            <label>Şifre (tekrar)</label>
            <input type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
          </div>
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? 'Kuruluyor…' : 'Kurulumu Tamamla ve Gir'}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
}
