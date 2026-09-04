/**
 * TÜM VERİYİ SİLER: kullanıcılar + uygulama verisi.
 * Çalıştırma:  npm run db:reset
 * Sonrasında site /setup ekranını açar ve ilk yönetici hesabı yeniden oluşturulur.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const s = await prisma.appState.deleteMany();
  const u = await prisma.user.deleteMany();
  console.log(`Silindi: ${u.count} kullanıcı, ${s.count} uygulama verisi kaydı.`);
  console.log('Siteyi açınca /setup ekranı gelir.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
