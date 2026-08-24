'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CompleteButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function complete() {
    setLoading(true);
    await fetch(`/api/jobs/${jobId}/complete`, { method: 'POST' });
    setLoading(false);
    router.refresh();
  }

  return (
    <button className="btn btn-complete" disabled={loading} onClick={complete}>
      {loading ? 'İşaretleniyor...' : 'Tamamlandı olarak işaretle'}
    </button>
  );
}
