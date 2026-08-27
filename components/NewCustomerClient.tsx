'use client';
import { useState } from 'react';
import CustomerForm from '@/components/CustomerForm';

export default function NewCustomerClient() {
  const [type, setType] = useState<'FIRMA' | 'SAHIS' | null>(null);

  if (!type) {
    return (
      <div>
        <div className="page-head"><div><div className="page-title">Yeni Kişi</div><div className="page-sub">Önce türünü seçin.</div></div></div>
        <div className="type-choice">
          <div className="type-card" onClick={() => setType('SAHIS')}>
            <div className="emoji">👤</div><div className="label">Şahıs</div>
          </div>
          <div className="type-card" onClick={() => setType('FIRMA')}>
            <div className="emoji">🏢</div><div className="label">Firma</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head"><div><div className="page-title">{type === 'FIRMA' ? 'Firma Ekle' : 'Şahıs Ekle'}</div></div></div>
      <CustomerForm type={type} />
    </div>
  );
}
