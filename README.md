# ROTA — Canlı Sürüm

Reklam / tabela atölyesi iş akışı: keşif → teklif → tasarım → üretim → montaj → tahsilat.
Kişiler, teklifler, işler, haftalık plan, ön muhasebe, personel, mesai, araçlar tek uygulamada.

## Nasıl çalışır

| Parça | Nerede | Ne yapar |
|---|---|---|
| Uygulama | `public/rota.html` | Arayüzün tamamı tek dosya. Kök adres (`/`) doğrudan bunu açar. |
| Giriş | `/login` | E-posta + şifre. Roller: Yönetici, Tasarım, Üretim, Montaj, Muhasebe. |
| İlk kurulum | `/setup` | Veritabanında hiç kullanıcı yokken açılır; firma adı + ilk yönetici hesabı. |
| Veri | `AppState` tablosu | Tüm uygulama verisi tek JSON belgesi. Her değişiklik ~1 sn içinde otomatik kaydedilir; 15 sn'de bir diğer cihazların değişiklikleri çekilir. |
| Hesaplar | `User` tablosu | Şifreler bcrypt ile saklanır. Yönetim → Kullanıcılar ekranından açılır / kaldırılır / şifre belirlenir. |

API uçları: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`,
`GET|PUT /api/state` (sürüm kontrollü; eski sürümün üstüne yazma 409 ile reddedilir),
`GET|POST|PATCH|DELETE /api/users` (yönetici), `GET|POST /api/setup` (yalnızca ilk kurulum).

## Yayına alma (Vercel + Neon)

Ortam değişkenleri (Vercel → Settings → Environment Variables):

```
DATABASE_URL = postgresql://...   (Neon bağlantı adresi)
JWT_SECRET   = en az 32 karakter rastgele metin
```

Yerelde `.env` dosyası aynı iki satırı taşır (`.env.example`'a bakın). `.env` asla commit'lenmez.

## Bilgisayarda çalıştırma

```
npm install
npx prisma db push --accept-data-loss   # tabloları oluşturur / günceller
npm run dev                             # http://localhost:3000
```

## Veritabanını sıfırlama

```
npm run db:reset
```

Tüm kullanıcıları ve uygulama verisini siler. Site bir sonraki açılışta `/setup` ekranını gösterir.

## Yeni sürüm çıkarma

`public/rota.html` dosyasını güncelleyip `git push` etmek yeterli; Vercel otomatik yayınlar.
Veri yapısı değişmediği sürece veritabanına dokunmak gerekmez.

## Sınırlar (1. faz)

- Tüm veri tek belgede tutulur; birkaç MB'a kadar sorunsuz. Büyüdüğünde tablolara bölünecek.
- İki kişi aynı anda kaydederse ikincisi "çakışma" uyarısı alır ve sayfa yenilenir; o son değişiklik tekrar girilmelidir.
- Rol yetkileri arayüzde uygulanır; sunucu tarafında yalnızca kullanıcı yönetimi yönetici ile sınırlıdır.
