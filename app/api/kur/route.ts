import { NextResponse } from 'next/server';

// Günlük döviz kuru: TCMB döviz satış (banka satış) — 3 saatlik sunucu önbelleği.
// TCMB'ye ulaşılamazsa piyasa orta kuru (open.er-api.com) yaklaşık değer olarak döner.
export const dynamic = 'force-dynamic';

let onbellek: { veri: Record<string, unknown>; zaman: number } | null = null;

export async function GET() {
  if (onbellek && Date.now() - onbellek.zaman < 3 * 60 * 60 * 1000) {
    return NextResponse.json(onbellek.veri);
  }
  try {
    const r = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml', { cache: 'no-store' });
    if (!r.ok) throw new Error('tcmb ' + r.status);
    const xml = await r.text();
    const kur = (kod: string) => {
      const m = xml.match(new RegExp('CurrencyCode="' + kod + '"[\\s\\S]*?<ForexSelling>([\\d.]+)</ForexSelling>'));
      return m ? Number(m[1]) : 0;
    };
    const tarih = (xml.match(/Tarih="([^"]+)"/) || [])[1] || '';
    const veri = { usd: kur('USD'), eur: kur('EUR'), tarih, kaynak: 'TCMB Döviz Satış' };
    if (!veri.usd) throw new Error('tcmb bos');
    onbellek = { veri, zaman: Date.now() };
    return NextResponse.json(veri);
  } catch {
    try {
      const [ru, re] = await Promise.all([
        fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' }).then((x) => x.json()),
        fetch('https://open.er-api.com/v6/latest/EUR', { cache: 'no-store' }).then((x) => x.json()),
      ]);
      const veri = {
        usd: (ru && ru.rates && ru.rates.TRY) || 0,
        eur: (re && re.rates && re.rates.TRY) || 0,
        tarih: '',
        kaynak: 'Piyasa (yaklaşık)',
      };
      if (!veri.usd) throw new Error('yedek bos');
      onbellek = { veri, zaman: Date.now() };
      return NextResponse.json(veri);
    } catch {
      return NextResponse.json({ usd: 0, eur: 0, tarih: '', kaynak: 'ulaşılamadı' }, { status: 502 });
    }
  }
}
