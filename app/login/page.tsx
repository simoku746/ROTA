'use client';
import { useEffect, useRef, useState } from 'react';

const HATIRLA_ANAHTAR = 'rotaGirisEmail';

export default function LoginPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [hatirla, setHatirla] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Hiç kullanıcı yoksa ilk kurulum ekranına yönlendir; kayıtlı e-postayı doldur.
  useEffect(() => {
    fetch('/api/setup', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.needsSetup) window.location.replace('/setup'); })
      .catch(() => {});
    try {
      const kayitli = localStorage.getItem(HATIRLA_ANAHTAR);
      if (kayitli && emailRef.current && !emailRef.current.value) {
        emailRef.current.value = kayitli;
        // E-posta doluysa imleç şifreye gelsin — tarayıcı kayıtlı şifreyi önerir.
        passRef.current?.focus();
      }
      if (kayitli === null) setHatirla(true);
    } catch {}
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    // Değerler DOM'dan okunur — tarayıcının/Windows'un otomatik doldurduğu
    // kullanıcı adı ve şifre, alana hiç dokunulmasa bile buradan gelir.
    const email = emailRef.current?.value.trim() ?? '';
    const password = passRef.current?.value ?? '';
    if (!email || !password) { setError('E-posta ve şifre gerekli'); return; }
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
      try {
        if (hatirla) localStorage.setItem(HATIRLA_ANAHTAR, email);
        else localStorage.removeItem(HATIRLA_ANAHTAR);
      } catch {}
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
        <form onSubmit={handleSubmit} method="post" action="/api/auth/login">
          <div className="field">
            <label>E-posta</label>
            <input ref={emailRef} type="email" name="email" autoComplete="username" required autoFocus />
          </div>
          <div className="field">
            <label>Şifre</label>
            <input ref={passRef} type="password" name="password" autoComplete="current-password" required />
          </div>
          <label className="hatirla-satir">
            <input type="checkbox" checked={hatirla} onChange={(e) => setHatirla(e.target.checked)} />
            Beni hatırla
          </label>
          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
        <div className="auth-foot">Şifrenizi yöneticiniz sıfırlayabilir.</div>
        <div className="imza">Fikir &amp; Tasarım — <b>Seyit Can KARATEPE</b></div>
      </div>
    </div>
  );
}
