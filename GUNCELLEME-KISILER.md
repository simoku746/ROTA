# ROTA — Kişiler Modülü + Yeni Tasarım Güncellemesi

Bu güncelleme iki büyük şey ekliyor:
1. Sol menülü, mor temalı yeni tasarım (Header yerine Sidebar)
2. Gerçek çalışan **Kişiler** modülü (veritabanına kaydediyor)

## Kurulum adımları

Bu klasördeki her şeyi mevcut `rota-app` proje klasörünüzün üzerine kopyalayın (üzerine yazma sorarsa onaylayın), sonra:

### 1. GitHub'a gönderin

PowerShell'de proje klasöründeyken:
```
git add .
git commit -m "Kisiler modulu ve yeni tasarim"
git push
```

### 2. Veritabanı şemasını güncelleyin

**Önemli:** Bu sefer veritabanına yeni bir tablo (Customer/Kişiler) eklendi. Bunu Vercel otomatik yapmaz, sizin bir kerelik çalıştırmanız gerekiyor:

```
npm install
npm run db:push
```

`db:push` komutu "Your database is now in sync" derse tamam demektir — yeni Kişiler tablosu veritabanınızda oluştu.

### 3. Vercel otomatik yayınlayacak

`git push` sonrası Vercel birkaç dakika içinde yeni sürümü otomatik yayınlar. `rotaajans2.vercel.app` adresine gidip kontrol edin:

- Sol menü artık yeni tasarımda olmalı
- **Kişiler** sekmesi görünmeli (Yönetici ve Muhasebe rollerinde)
- Kişiler'de "+ Yeni" ile Şahıs/Firma ekleyip, listeye dönüp tekrar tıklayarak düzenleyebilmelisiniz

### Bir şey ters giderse

Build hatası alırsanız Vercel'in "Deployments" sekmesinden en son denemeye tıklayıp "Build Logs"a bakın, hata mesajının tamamını buraya yapıştırın.
