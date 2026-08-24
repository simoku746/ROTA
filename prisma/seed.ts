import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('demo1234', 10);

  const users = [
    { email: 'yonetici@ajans.com', name: 'Ayşe (Yönetici)', role: 'YONETICI' as const },
    { email: 'tasarim@ajans.com', name: 'Ece (Tasarım)', role: 'TASARIM' as const },
    { email: 'uretim@ajans.com', name: 'Üretim Atölye', role: 'URETIM' as const },
    { email: 'montaj@ajans.com', name: 'Montaj Ekip A', role: 'MONTAJ' as const },
    { email: 'muhasebe@ajans.com', name: 'Muhasebe', role: 'MUHASEBE' as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash: password },
    });
  }

  const jobs = [
    { code: 'AJ-2601', client: 'Kaya İnşaat', description: 'Şantiye tabelası + cephe branda', stage: 'KESIF' as const, material: '3mm dibond + branda baskı', cost: 14500, assignee: 'Deniz (Saha)', payStatus: 'BEKLIYOR' as const },
    { code: 'AJ-2598', client: 'Mavi Market Zinciri', description: '12 şube tabela yenileme', stage: 'TASARIM' as const, material: 'Kutu harf + ışıklı pano', cost: 62000, assignee: 'Ece (Grafik)', payStatus: 'BEKLIYOR' as const, approval: 'BEKLIYOR' as const },
    { code: 'AJ-2594', client: 'Orkide Mobilya', description: 'Mağaza içi yönlendirme sistemi', stage: 'TASARIM' as const, material: 'Pleksi + folyo baskı', cost: 9800, assignee: 'Ece (Grafik)', payStatus: 'KISMI' as const, approval: 'REVIZYON' as const },
    { code: 'AJ-2590', client: 'Pinar Su', description: 'Otoyol billboard kampanyası', stage: 'URETIM' as const, material: 'Branda 6x3m dijital baskı', cost: 22300, assignee: 'Üretim Atölye 1', payStatus: 'BEKLIYOR' as const, approval: 'ONAYLANDI' as const },
    { code: 'AJ-2585', client: 'Star Eczane', description: 'LED tabela + ışıklı kutu harf', stage: 'MONTAJ' as const, material: 'LED modül + alüminyum kasa', cost: 18750, assignee: 'Montaj Ekip A', payStatus: 'KISMI' as const, approval: 'ONAYLANDI' as const },
    { code: 'AJ-2580', client: 'Barış Otomotiv', description: 'Showroom cam giydirme', stage: 'MONTAJ' as const, material: 'One-way vision folyo', cost: 7200, assignee: 'Montaj Ekip B', payStatus: 'BEKLIYOR' as const, approval: 'ONAYLANDI' as const },
    { code: 'AJ-2577', client: 'Nazlı Kuaför', description: 'Vitrin tabelası', stage: 'TAHSILAT' as const, material: 'Kutu harf', cost: 5400, assignee: 'Muhasebe', payStatus: 'TAMAMLANDI' as const, approval: 'ONAYLANDI' as const },
  ];

  for (const j of jobs) {
    await prisma.job.upsert({ where: { code: j.code }, update: {}, create: j });
  }

  console.log('Seed tamamlandı. Demo kullanıcı şifresi: demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
