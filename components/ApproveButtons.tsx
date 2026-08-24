'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ApproveButtons({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function decide(decision: 'ONAYLANDI' | 'REVIZYON') {
    setLoading(true);
    await fetch(`/api/jobs/${jobId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="btns">
      <button className="btn btn-approve" disabled={loading} onClick={() => decide('ONAYLANDI')}>
        Onaylandı
      </button>
      <button className="btn btn-revise" disabled={loading} onClick={() => decide('REVIZYON')}>
        Revizyon
      </button>
    </div>
  );
}
