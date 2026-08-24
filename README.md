# ROTA — Kurulum ve Yayına Alma Rehberi

Bu, ROTA projesinin gerçek (demo değil) sürümüdür: gerçek giriş, gerçek veritabanı, rol bazlı erişim sunucu tarafında uygulanıyor.

## İçindekiler
1. Neon'da veritabanı oluşturma
2. GitHub'a yükleme
3. Vercel'e bağlama ve yayınlama
4. Veritabanını hazırlama (tabloları oluşturma + örnek veri)
5. Demo giriş bilgileri

---

## 1. Neon'da veritabanı oluşturma

1. **neon.tech** adresine gidin, ücretsiz hesap açın (GitHub ile giriş yapabilirsiniz)
2. **"Create a project"** deyin, bir proje adı verin (örn. `rota-db`)
3. Proje oluşunca size bir **bağlantı adresi (connection string)** verilecek — `postgresql://...` ile başlayan uzun bir metin. Bunu bir yere kopyalayın, birazdan lazım olacak.

## 2. GitHub'a yükleme

Bilgisayarınızda bir terminal (Mac: Terminal, Windows: PowerShell) açın ve bu klasörün içine girin, sonra sırasıyla:

```
git init
git add .
git commit -m "İlk sürüm"
```

Sonra GitHub'da yeni bir repo (depo) oluşturun:
1. github.com'da sağ üstteki **"+"** işaretine tıklayın → **"New repository"**
2. Bir isim verin (örn. `rota-app`), **Private** (özel) seçin — bu önemli, kodunuz herkese açık olmasın
3. **"Create repository"** deyin
4. Açılan sayfada size verilen komutları terminalinize kopyalayıp çalıştırın (aşağıdakine benzer olacak, ama GitHub size özel adresi verecek):

```
git remote add origin https://github.com/KULLANICI_ADINIZ/rota-app.git
git branch -M main
git push -u origin main
```

## 3. Vercel'e bağlama ve yayınlama

1. Vercel dashboard'a girin, **"New Project"** (veya "Add New...") tıklayın
2. GitHub repo listenizden **rota-app**'i bulup **"Import"** deyin
3. Karşınıza ayar ekranı çıkacak — **"Environment Variables"** (Ortam Değişkenleri) bölümüne şunları ekleyin:
   - `DATABASE_URL` → Neon'dan aldığınız bağlantı adresi
   - `JWT_SECRET` → rastgele, uzun bir metin (örn. tarayıcınızda "random string generator" arayıp 40 karakterlik bir tane üretebilirsiniz)
4. **"Deploy"** butonuna basın, 1-2 dakika sürer
5. Bitince size bir adres verilecek (örn. `rota-app.vercel.app`) — siteniz artık canlıda

## 4. Veritabanını hazırlama

İlk yayından sonra veritabanı tabloları henüz boş. Bunu bilgisayarınızdan bir kerelik şu komutlarla dolduracaksınız:

Proje klasörünüzde bir `.env` dosyası oluşturun (`.env.example` dosyasını kopyalayıp adını `.env` yapın), içine Neon'dan aldığınız `DATABASE_URL` ve oluşturduğunuz `JWT_SECRET`'i yapıştırın. Sonra terminalde:

```
npm install
npm run db:push
npm run db:seed
```

- `db:push` → veritabanında tabloları oluşturur
- `db:seed` → demo kullanıcıları ve örnek işleri yükler

## 5. Demo giriş bilgileri

Seed işleminden sonra şu hesaplarla giriş yapabilirsiniz (hepsinin şifresi `demo1234`):

| E-posta | Rol |
|---|---|
| yonetici@ajans.com | Yönetici |
| tasarim@ajans.com | Tasarım |
| uretim@ajans.com | Üretim |
| montaj@ajans.com | Montaj (Saha) |
| muhasebe@ajans.com | Muhasebe |

**Gerçek kullanıma geçerken:** Bu demo hesapları silin/şifrelerini değiştirin, gerçek çalışanlarınız için `prisma/seed.ts` dosyasındaki listeyi kendi ekibinizle güncelleyip tekrar `npm run db:seed` çalıştırın (ya da ileride bir "kullanıcı ekle" ekranı yaparız).

---

## Bir yerde takılırsanız

Hata mesajının tamamını kopyalayıp bana gösterin, birlikte çözeriz. En sık karşılaşılan sorunlar:
- `DATABASE_URL` yanlış kopyalanmış olabilir (baştaki/sondaki boşluklara dikkat)
- Vercel'de environment variable eklemeyi unutmak — eklerseniz "Redeploy" (yeniden yayınla) demeniz gerekir
- `npm install` sırasında hata — Node.js'in bilgisayarınızda kurulu olması gerekir (nodejs.org'dan indirilebilir)
