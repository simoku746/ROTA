'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ContactRow = { type: string; value: string };
type AddressRow = { type: string; country: string; postal: string; ilce: string; sehir: string; eyalet: string; detail: string };

const CONTACT_TYPES = ['İş Telefon No', 'Cep Telefonu', 'E-posta', 'Faks'];
const ADDRESS_TYPES = ['İş Adresi', 'Ev Adresi', 'Diğer'];

export default function CustomerForm({ type, existing }: { type: 'FIRMA' | 'SAHIS'; existing?: any }) {
  const router = useRouter();
  const isFirma = type === 'FIRMA';
  const [name, setName] = useState(existing?.name || '');
  const [yetkili, setYetkili] = useState(existing?.contact || '');
  const [kaynak, setKaynak] = useState(existing?.kaynak || '');
  const [kampanya, setKampanya] = useState(existing?.kampanya || '');
  const [temsilci, setTemsilci] = useState(existing?.temsilci || '');
  const [sektor, setSektor] = useState(existing?.sektor || '');
  const [etiket, setEtiket] = useState(existing?.etiket || '');
  const [kisaAciklama, setKisaAciklama] = useState(existing?.kisaAciklama || '');
  const [hatirlatma, setHatirlatma] = useState(existing?.hatirlatma || '');
  const [contactRows, setContactRows] = useState<ContactRow[]>(
    existing?.contactRows?.length ? existing.contactRows : [{ type: 'İş Telefon No', value: existing?.phone || '' }]
  );
  const [addressRows, setAddressRows] = useState<AddressRow[]>(
    existing?.addressRows?.length ? existing.addressRows : [{ type: 'İş Adresi', country: 'Türkiye', postal: '', ilce: '', sehir: '', eyalet: '', detail: existing?.address || '' }]
  );
  const [faturaUnvani, setFaturaUnvani] = useState(existing?.faturaUnvani || '');
  const [vergiNo, setVergiNo] = useState(existing?.vergiNo || '');
  const [vergiDairesi, setVergiDairesi] = useState(existing?.vergiDairesi || '');
  const [faturaAdresi, setFaturaAdresi] = useState(existing?.faturaAdresi || '');
  const [vadeGun, setVadeGun] = useState(existing?.vadeGun || '');
  const [calisanSayisi, setCalisanSayisi] = useState(existing?.calisanSayisi || '');
  const [openAcc, setOpenAcc] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  function toggleAcc(key: string) {
    setOpenAcc((s) => ({ ...s, [key]: !s[key] }));
  }

  async function handleSave() {
    if (!name.trim()) {
      alert(isFirma ? 'Firma adı gerekli' : 'Ad Soyad gerekli');
      return;
    }
    setSaving(true);
    const phoneRow = contactRows.find((r) => r.type.includes('Telefon'));
    const emailRow = contactRows.find((r) => r.type === 'E-posta');
    const addr = addressRows[0];
    const payload = {
      type,
      name,
      contact: isFirma ? yetkili : name,
      phone: phoneRow?.value || '',
      email: emailRow?.value || '',
      address: [addr?.detail, addr?.ilce, addr?.sehir].filter(Boolean).join(', '),
      kaynak, kampanya, temsilci, sektor, etiket, kisaAciklama, hatirlatma,
      contactRows, addressRows,
      faturaUnvani, vergiNo, vergiDairesi, faturaAdresi,
      vadeGun: vadeGun ? Number(vadeGun) : null,
      calisanSayisi: calisanSayisi ? Number(calisanSayisi) : null,
    };

    const res = existing
      ? await fetch(`/api/customers/${existing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    setSaving(false);
    if (!res.ok) { alert('Kaydedilemedi, tekrar deneyin.'); return; }
    router.push('/kisiler');
    router.refresh();
  }

  return (
    <div className="form-page">
      <div className="form-block">
        <div className="avatar-upload">
          <div className="avatar-circle">{isFirma ? '🏢' : '👤'}</div>
        </div>
        <div className="form-main-field">
          <label>{isFirma ? 'Firma Adı' : 'Ad Soyad'}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={isFirma ? 'Örn. Adalı İnşaat' : 'Örn. Ahmet Yılmaz'} />
        </div>
      </div>

      <div className="form-block">
        <div className="field-row">
          <div className="field"><label>Kaynak</label><input value={kaynak} onChange={(e) => setKaynak(e.target.value)} placeholder="Örn. Referans, Google" /></div>
          <div className="field"><label>Kampanya</label><input value={kampanya} onChange={(e) => setKampanya(e.target.value)} placeholder="Varsa kampanya adı" /></div>
        </div>
        <div className="field"><label>Temsilci</label><input value={temsilci} onChange={(e) => setTemsilci(e.target.value)} placeholder="Temsilci adı" /></div>
      </div>

      <div className="form-block">
        <div className="accordion">
          <div className="accordion-head" onClick={() => toggleAcc('diger')}>
            <span className="accordion-plus" style={{ transform: openAcc.diger ? 'rotate(45deg)' : 'none' }}>+</span>Diğer Bilgiler
          </div>
          {openAcc.diger && (
            <div className="accordion-body">
              <div className="field"><label>Sektör</label><input value={sektor} onChange={(e) => setSektor(e.target.value)} /></div>
              <div className="field-row">
                <div className="field"><label>Etiket</label><input value={etiket} onChange={(e) => setEtiket(e.target.value)} /></div>
                <div className="field"><label>Kısa Açıklama</label><input value={kisaAciklama} onChange={(e) => setKisaAciklama(e.target.value)} /></div>
              </div>
              <div className="field"><label>Hatırlatma Notu</label><textarea rows={3} value={hatirlatma} onChange={(e) => setHatirlatma(e.target.value)} /></div>
            </div>
          )}
        </div>

        <div className="accordion">
          <div className="accordion-head" onClick={() => toggleAcc('iletisim')}>
            <span className="accordion-plus" style={{ transform: openAcc.iletisim ? 'rotate(45deg)' : 'none' }}>+</span>İletişim Bilgisi
          </div>
          {openAcc.iletisim && (
            <div className="accordion-body">
              {isFirma && (
                <div className="field" style={{ marginBottom: 16 }}>
                  <label>Yetkili Kişi</label>
                  <input value={yetkili} onChange={(e) => setYetkili(e.target.value)} placeholder="Örn. Kaan Taşdemir" />
                </div>
              )}
              <div className="sub-block">
                <div className="sub-block-head"><h4>İletişim Bilgisi</h4>
                  <button type="button" onClick={() => setContactRows([...contactRows, { type: 'İş Telefon No', value: '' }])} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: 12.5 }}>+ Yeni Ekle</button>
                </div>
                {contactRows.map((r, i) => (
                  <div className="repeat-row" key={i}>
                    <select value={r.type} onChange={(e) => setContactRows(contactRows.map((x, xi) => xi === i ? { ...x, type: e.target.value } : x))}>
                      {CONTACT_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <input value={r.value} onChange={(e) => setContactRows(contactRows.map((x, xi) => xi === i ? { ...x, value: e.target.value } : x))} placeholder="Değer girin" />
                    <button className="row-remove" type="button" onClick={() => setContactRows(contactRows.filter((_, xi) => xi !== i))}>✕</button>
                  </div>
                ))}
              </div>
              <div className="sub-block">
                <div className="sub-block-head"><h4>Adresler</h4>
                  <button type="button" onClick={() => setAddressRows([...addressRows, { type: 'İş Adresi', country: 'Türkiye', postal: '', ilce: '', sehir: '', eyalet: '', detail: '' }])} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: 12.5 }}>+ Yeni Ekle</button>
                </div>
                {addressRows.map((a, i) => (
                  <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                    <div className="repeat-row">
                      <select value={a.type} onChange={(e) => setAddressRows(addressRows.map((x, xi) => xi === i ? { ...x, type: e.target.value } : x))}>
                        {ADDRESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <input value={a.country} onChange={(e) => setAddressRows(addressRows.map((x, xi) => xi === i ? { ...x, country: e.target.value } : x))} placeholder="Ülke" />
                      <button className="row-remove" type="button" onClick={() => setAddressRows(addressRows.filter((_, xi) => xi !== i))}>✕</button>
                    </div>
                    <div className="field-row" style={{ marginBottom: 8 }}>
                      <input value={a.postal} onChange={(e) => setAddressRows(addressRows.map((x, xi) => xi === i ? { ...x, postal: e.target.value } : x))} placeholder="Posta Kodu" />
                      <input value={a.ilce} onChange={(e) => setAddressRows(addressRows.map((x, xi) => xi === i ? { ...x, ilce: e.target.value } : x))} placeholder="İlçe" />
                    </div>
                    <div className="field-row" style={{ marginBottom: 8 }}>
                      <input value={a.sehir} onChange={(e) => setAddressRows(addressRows.map((x, xi) => xi === i ? { ...x, sehir: e.target.value } : x))} placeholder="Şehir" />
                      <input value={a.eyalet} onChange={(e) => setAddressRows(addressRows.map((x, xi) => xi === i ? { ...x, eyalet: e.target.value } : x))} placeholder="Eyalet" />
                    </div>
                    <textarea rows={2} value={a.detail} onChange={(e) => setAddressRows(addressRows.map((x, xi) => xi === i ? { ...x, detail: e.target.value } : x))} placeholder="Adres detayı" style={{ width: '100%' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="accordion">
          <div className="accordion-head" onClick={() => toggleAcc('fatura')}>
            <span className="accordion-plus" style={{ transform: openAcc.fatura ? 'rotate(45deg)' : 'none' }}>+</span>Fatura Bilgileri
          </div>
          {openAcc.fatura && (
            <div className="accordion-body">
              <div className="field"><label>Fatura Unvanı</label><input value={faturaUnvani} onChange={(e) => setFaturaUnvani(e.target.value)} /></div>
              <div className="field"><label>Vergi No</label><input value={vergiNo} onChange={(e) => setVergiNo(e.target.value)} /></div>
              <div className="field"><label>Vergi Dairesi</label><input value={vergiDairesi} onChange={(e) => setVergiDairesi(e.target.value)} /></div>
              <div className="field"><label>Fatura Adresi</label><textarea rows={2} value={faturaAdresi} onChange={(e) => setFaturaAdresi(e.target.value)} /></div>
              <div className="field"><label>Vade Gün Sayısı</label><input type="number" value={vadeGun} onChange={(e) => setVadeGun(e.target.value)} /></div>
            </div>
          )}
        </div>

        <div className="accordion">
          <div className="accordion-head" onClick={() => toggleAcc('ozel')}>
            <span className="accordion-plus" style={{ transform: openAcc.ozel ? 'rotate(45deg)' : 'none' }}>+</span>Özel Alan
          </div>
          {openAcc.ozel && (
            <div className="accordion-body">
              <div className="field"><label>Çalışan Sayısı</label><input type="number" value={calisanSayisi} onChange={(e) => setCalisanSayisi(e.target.value)} /></div>
            </div>
          )}
        </div>
      </div>

      <div className="form-page-footer">
        <button className="back-btn" onClick={() => router.push('/kisiler')}>←</button>
        <button className="save-btn" onClick={handleSave} disabled={saving}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
      </div>
    </div>
  );
}
