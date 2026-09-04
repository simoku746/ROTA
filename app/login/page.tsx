'use client';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hiç kullanıcı yoksa ilk kurulum ekranına yönlendir.
  useEffect(() => {
    fetch('/api/setup', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.needsSetup) window.location.replace('/setup'); })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Giriş başarısız');
        setLoading(false);
        return;
      }
      // Uygulama statik bir sayfa (rota.html) olduğu için tam yükleme gerekir.
      window.location.href = '/';
    } catch {
      setError('Sunucuya ulaşılamadı');
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-brand"><span className="auth-logo">R</span>ROTA</div>
        <p className="auth-sub">Keşiften tahsilata, tek rota.</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>E-posta</label>
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>Şifre</label>
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
        <div className="auth-foot">Şifrenizi yöneticiniz sıfırlayabilir.</div>
      </div>
    </div>
  );
}
