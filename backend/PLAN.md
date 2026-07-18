# Artı Backend Mimari ve Geliştirme Planı — Revize v2

Türkiye'nin "Too Good To Go" alternatifi **Artı** uygulamasının backend mimarisi.
Bu sürüm; stok atomikliği, ödeme akışı, webhook güvenliği, KVKK uyumu ve
operasyonel dayanıklılık eksikleri giderilerek revize edilmiştir.

> **Karar verilen açık sorular:**
> - Ödeme: **iyzico** (Checkout Form) — `PaymentProvider` adapter arayüzüyle, PayTR'ye geçiş kapısı açık.
> - Desk360: dokümantasyon gelene kadar **simülatörle** geliştirilecek; handler imza doğrulamasına hazır yazılacak.
> - X-Proxy-Secret: tek EC2 + Nginx kurulumunda **kullanılmayacak** — Node `127.0.0.1:5000`'e bind edilir,
>   security group 5000'i dışarı kapatır. İleride CDN (CloudFront/Cloudflare) eklenirse secret header + CDN IP allowlist devreye alınır.

---

## 1. Genel Sistem Mimarisi

| Katman | Teknoloji | Not |
|---|---|---|
| API | Node.js + Express | Mevcut iskelet korunur |
| Veritabanı | **MongoDB Atlas** | EC2'ye Mongo kurulmaz — backup/replica/güvenlik Atlas'a bırakılır |
| Kuyruk & Zamanlama | **BullMQ + Redis** (ElastiCache veya EC2 üzerinde tek Redis) | node-cron yalnızca BullMQ'ya "tekrarlanan job" tanımlamak için; PM2 cluster'da çift tetikleme yaşanmaz çünkü job'lar kuyruktan tek tüketilir |
| Dosya Depolama | AWS S3 (presigned URL ile direkt yükleme) | İşletme logosu, kutu görselleri |
| Ödeme | iyzico Checkout Form | Kart verisi sunucuya hiç uğramaz (PCI-DSS yükü ~sıfır) |
| WhatsApp | Desk360 API + webhook | Aşama 1'de simülatör |
| Deploy | AWS EC2 (Ubuntu) + PM2 + Nginx + Let's Encrypt (certbot, HSTS) | Node yalnızca 127.0.0.1'i dinler |
| İzleme | pino (log) + Sentry (hata) + `/healthz` + UptimeRobot | |

**Zaman dilimi kuralı:** Sunucular UTC çalışır; tüm pickup/cron hesapları
`Europe/Istanbul` üzerinden **luxon** ile yapılır. Çıplak `new Date()` saat
karşılaştırması yasak.

**Secret yönetimi:** `.env` yalnızca lokalde; üretimde AWS SSM Parameter Store.
`JWT_SECRET`, `MONGO_URI` gibi zorunlu değişkenler yoksa uygulama **başlamaz**
(fail-fast). Kodda hardcoded fallback secret bulunamaz — mevcut
`'super-secret-arti-jwt-key-change-this'` fallback'i kaldırılacak.

---

## 2. Veritabanı Modelleri

### User (Müşteri — mobil uygulama)
- isim, e-posta (unique), telefon, bcrypt şifre (select: false)
- konum (GeoJSON Point), favori işletmeler
- `paymentCustomerId` (iyzico kart saklama referansı — kart verisi bizde tutulmaz)
- `emailVerifiedAt`, `refreshTokenHash`, `passwordResetToken/Expires`

### Business (İşletme)
- Mevcut alanlar + `status: PENDING_APPROVAL | APPROVED | SUSPENDED` (varsayılan PENDING_APPROVAL)
- `workingDays[]`, `workingHours`, `pickupTimeStart/End`
- `defaultPackageCount`, `desk360ChatId`, `whatsappPhone`
- **`taxNumber` field-level şifreli saklanır** (KVKK — bkz. §6)
- S3 görsel URL'leri
- İndeks: `location` 2dsphere (mevcut)

### SurpriseBox (Günlük envanter)
- `businessId` (ref), `date` (gün)
- `initialStock`, `extraStock` (Desk360'tan), `remaining`
- `price`, `originalPrice`, `contents[]`
- İndeks: `{ businessId: 1, date: 1 }` unique; `{ date: 1, remaining: 1 }` (aktif kutu sorguları)

### Order (Sipariş) — durum makinesi
```
RESERVED ──ödeme ok──▶ PAID ──QR okutuldu──▶ PICKED_UP
   │                     │
   │ 10 dk ödeme yok     └──iade──▶ REFUNDED
   ▼
EXPIRED (stok geri salınır)
```
- `userId`, `businessId`, `boxId`, `amount`, `status`
- `qrToken`: UUID + HMAC imza, **tek kullanımlık**, `usedAt` damgası
- `paymentId`, `idempotencyKey` (unique, sparse)
- `reservedAt` — süresi dolan rezervasyonları BullMQ gecikmeli job'ı temizler

### AdminUser
- e-posta, bcrypt şifre, rol (`superadmin | operator`)
- İşletme onayı ve iade yönetimi için minimum back-office

---

## 3. Kritik İş Akışları

### 3.1 Satın alma — stok atomikliği (overselling koruması)
1. `POST /orders/checkout` → **atomik rezervasyon**:
   `SurpriseBox.findOneAndUpdate({ _id, remaining: { $gt: 0 } }, { $inc: { remaining: -1 } })`
   Dönen null ⇒ "tükendi" cevabı. Başarılıysa `Order(RESERVED)` yaratılır.
2. iyzico Checkout Form başlatılır; `conversationId = order._id`.
3. BullMQ'ya 10 dk gecikmeli `expire-order` job'ı atılır: sipariş hâlâ RESERVED ise
   EXPIRED yapılır ve `$inc: { remaining: +1 }` ile stok geri verilir.
4. iyzico callback (§3.2) siparişi PAID yapar, QR token üretir.

### 3.2 Ödeme callback güvenliği
- iyzico dönüşünde **imza doğrulaması** yapılır; `token` sunucudan
  `retrieveCheckoutForm` ile teyit edilir (client'tan gelen "başarılı" bilgisine asla güvenilmez).
- `idempotencyKey` unique indeksi sayesinde aynı callback iki kez işlenemez.
- İade: `POST /admin/orders/:id/refund` → iyzico refund API → status REFUNDED.

### 3.3 Teslimat — QR doğrulama
- `POST /business/orders/verify` (işletme JWT'si ile): `{ qrToken }`
- Atomik: `Order.findOneAndUpdate({ qrToken, status: 'PAID', usedAt: null }, { status: 'PICKED_UP', usedAt: now })`
- HMAC imzası sunucu tarafında doğrulanır; tahmin edilebilir sıra numarası kullanılmaz.

### 3.4 Desk360 WhatsApp otomasyonu
1. BullMQ repeatable job (5 dk'da bir): pickup saatine **4 saat** kalan,
   bugün mesaj atılmamış APPROVED işletmeleri bulur (`Europe/Istanbul` ile hesap).
2. Desk360 API'sine şablon mesaj: *"Merhaba, bugün fazladan paketiniz var mı? Varsa sayıyı yazabilirsiniz."*
3. Cevap webhook'u `POST /webhooks/desk360`:
   - **Güvenlik:** HMAC imza (Desk360 destekliyorsa) **veya** URL'de uzun rastgele token
     (`/webhooks/desk360/:webhookSecret`) + IP allowlist. İkisi de yoksa endpoint açılmaz.
   - **Parse stratejisi:** mesajdan `\d+` regex ile sayı çekilir (örn. "bugün 5 tane var" → 5).
     Sayı çıkarılamazsa mesaj `PENDING_REVIEW` olarak loglanır, admin'e düşer — sessizce yutulmaz.
   - Eşleşme `desk360ChatId` üzerinden; zincir işletmelerde şube bazlı ayrı chatId zorunlu.
4. **Cevap gelmezse** (pickup'a 1 saat kala): `defaultPackageCount` ile kutu otomatik yayınlanır;
   işletme panelden düzeltebilir. (İş kuralı: hiç yayınlamamak yerine varsayılanla yayınla.)
5. Aşama 1'de `scripts/desk360-simulator.js` aynı formatta POST atarak akışı uçtan uca test eder;
   gerçek entegrasyon geldiğinde yalnızca imza doğrulaması eklenir.

---

## 4. API Uç Noktaları (tam liste)

**Müşteri**
- `POST /api/v1/users/register` · `login` · `refresh` · `logout`
- `POST /api/v1/users/forgot-password` · `reset-password`
- `GET  /api/v1/boxes` — $geoNear + `remaining > 0` + bugün; sayfalı
- `GET  /api/v1/businesses/:id`
- `POST /api/v1/orders/checkout` — rezervasyon + iyzico başlatma
- `GET  /api/v1/orders/mine`

**İşletme**
- `POST /api/v1/business/register` (→ PENDING_APPROVAL) · `login` · `refresh`
- `POST /api/v1/business/boxes` — kutu oluşturma/güncelleme
- `POST /api/v1/business/orders/verify` — QR teslim onayı
- `GET  /api/v1/business/orders/today`

**Webhook & sistem**
- `POST /api/v1/webhooks/desk360/:secret`
- `POST /api/v1/webhooks/iyzico`
- `GET  /healthz` — DB + Redis ping

**Admin**
- `POST /api/v1/admin/login`
- `GET  /api/v1/admin/businesses?status=PENDING_APPROVAL`
- `PATCH /api/v1/admin/businesses/:id/approve|suspend`
- `POST /api/v1/admin/orders/:id/refund`
- `GET  /api/v1/admin/webhook-reviews` — parse edilemeyen Desk360 mesajları

---

## 5. Kimlik Doğrulama Mimarisi

- **Access token:** JWT, 15 dk, rol claim'li (`user | business | admin`).
- **Refresh token:** 30 gün, httpOnly + Secure + SameSite=Strict cookie'de;
  DB'de hash'i tutulur, her kullanımda **rotate** edilir (çalınan token tek kullanımlık).
- Web'de access token bellekte tutulur — `localStorage.setItem('token', ...)` kaldırılır (XSS yüzeyi).
- Şifre sıfırlama: tek kullanımlık, 15 dk geçerli, hash'lenmiş token + e-posta (SES/Resend).
- Login/register/forgot uçlarına **ayrı sıkı rate limit** (15 dk'da 10) + `express-slow-down`.

---

## 6. Kurumsal Güvenlik Mimarisi (Kalkanlar)

Orijinal plandaki kalkanlar aynen korunur, üzerine eklenir:

1. **Helmet & HPP** — HTTP başlık güvenliği + parameter pollution engeli.
2. **CORS** — allowed-origins listesi env'den; frontend `VITE_API_URL` ile aynı kaynaktan yönetilir.
3. **Timeout kalkanı** (connect-timeout) — JSON 15 sn, multipart 120 sn.
4. **Prototype Pollution + derinlik sınırı** — body/query/params MAX_DEPTH=10, `__proto__`/`constructor` recursive temizlik.
5. **NoSQL Injection** — express-mongo-sanitize.
6. **Rate limiting** — global limit + uç bazlı limitler (auth uçları §5, webhook uçları ayrı, checkout ayrı).
7. **Payload limiti** — `limit: '2mb'`.
8. **➕ Şema doğrulama (zod)** — sanitize ≠ validate. Her endpoint'in DTO şeması var;
   bilinmeyen alanlar strip edilir, mantık kuralları (pickupEnd > pickupStart vb.) burada yakalanır.
9. **➕ Webhook imzaları** — Desk360 + iyzico (bkz. §3).
10. **➕ Fail-fast secrets** — zorunlu env eksikse süreç başlamaz; hardcoded fallback yok.
11. **➕ Ağ katmanı** — Node 127.0.0.1 bind; security group yalnızca 80/443 açık; SSH yalnızca anahtar + IP kısıtı.

---

## 7. KVKK Uyumu (yasal zorunluluk)

- **TCKN/VKN field-level şifreleme** (AES-256-GCM, anahtar SSM'de) — düz metin saklanmaz,
  loglara asla yazılmaz.
- Kayıt sihirbazına **aydınlatma metni + açık rıza checkbox'ı** eklenir (frontend işi, bu planla birlikte).
- `DELETE /api/v1/users/me` — veri silme talebi akışı (sipariş geçmişi yasal saklama süresi kadar anonimleştirilir).
- Veri işleme envanteri dokümanı (hangi alan, hangi amaç, saklama süresi) repo'da tutulur.
- Atlas şifreleme-at-rest + TLS zorunlu bağlantı.

---

## 8. Gözlemlenebilirlik

- **pino** yapılandırılmış log (JSON) + günlük rotasyon; request-id middleware.
- **Sentry** — yakalanmamış hatalar + BullMQ job hataları.
- `/healthz` — Mongo ping + Redis ping; UptimeRobot 1 dk aralıkla izler.
- Cron/worker her koşuda özet log yazar ("3 işletmeye mesaj atıldı") — "cron çalıştı mı?" sorusu loglardan cevaplanır.

---

## 9. Test ve Doğrulama Planı

**Otomatik (Jest + supertest + mongodb-memory-server, GitHub Actions CI):**
- Stok yarışı: aynı kutuya 20 eşzamanlı checkout → tam `initialStock` kadar RESERVED, fazlası 409.
- Rezervasyon süresi: sahte saat ile 10 dk sonra EXPIRED + stok iade.
- QR: aynı token ikinci kez → 409; imzası bozuk token → 401.
- Webhook: imzasız istek → 401; "bugün 5 tane var" → extraStock 5; "belki yarın" → PENDING_REVIEW.
- Ödeme idempotency: aynı callback iki kez → tek PAID sipariş.
- Güvenlik: `{"__proto__": {...}}` ve `{"email": {"$gt": ""}}` payload'ları → temizlenmiş/reddedilmiş.

**Manuel (Postman):**
- Timeout kalkanı 15. saniyede koparıyor mu (Slowloris simülasyonu).
- iyzico sandbox uçtan uca: checkout → 3D secure → callback → QR → teslim.
- Desk360 simülatörü ile tam otomasyon döngüsü.

---

## 10. Yol Haritası

**Faz 0 — Temel sertleştirme (mevcut kod üzerinde, ~hemen)**
Fail-fast env, hardcoded secret temizliği, zod şemaları, auth rate limitleri,
kalkan middleware'leri, healthz, pino+Sentry.

**Faz 1 — Çekirdek pazar yeri (P0)**
User modeli + auth (refresh dahil), SurpriseBox + atomik rezervasyon,
iyzico adapter + callback, Order state machine + QR verify,
Business onay akışı + minimum admin uçları, KVKK şifreleme + rıza.

**Faz 2 — Otomasyon**
Redis + BullMQ kurulumu, pickup tarama job'ı, Desk360 simülatörü + webhook handler,
cevapsız-işletme fallback'i, expire-order job'ı Faz 1'den buraya bağlanır.

**Faz 3 — Üretime çıkış**
EC2 + Nginx + certbot + PM2, SSM secrets, S3 presigned upload,
CI/CD (GitHub Actions → EC2 deploy), UptimeRobot, yük testi (k6 ile checkout senaryosu).

**Faz 4 — İyileştirmeler (P2)**
Favoriler/bildirimler, işletme paneli raporları, PayTR adapter'ı,
CDN + X-Proxy-Secret katmanı, gelişmiş fraud kuralları.
