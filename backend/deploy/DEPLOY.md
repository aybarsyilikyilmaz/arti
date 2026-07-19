# Artı — Üretime Çıkış Runbook'u (Faz 3)

Kod tarafı **hazır**; bu doküman AWS hesabı açıldığında izlenecek adımları anlatır.
Yayına kadar her şey lokalde `STORAGE_PROVIDER=local` ile çalışır — S3/EC2'ye geçiş
yalnızca env değişikliği + bu runbook'tur, kod değişmez.

## 0. Ön koşullar
- Alan adı (örn. `artiapp.com.tr`) ve DNS yönetimi
- AWS hesabı, MongoDB Atlas hesabı
- GitHub repo'su (CI/CD workflow'ları `.github/workflows/` altında hazır)

## 1. MongoDB Atlas
1. M0/M2 cluster aç (bölge: Frankfurt `eu-central-1` — Türkiye'ye en yakın).
2. Database user oluştur; **Network Access**'e yalnızca EC2'nin Elastic IP'sini ekle.
3. Bağlantı dizesini al → `MONGO_URI` (TLS zorunlu, Atlas varsayılanı).

## 2. EC2
1. Ubuntu 24.04, `t3.small` (başlangıç için yeterli), Elastic IP ata.
2. Security group: **yalnızca 80/443 herkese açık**; 22 sadece kendi IP'n; 5002 kapalı.
3. Kurulum:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs nginx redis-server
   sudo npm i -g pm2
   sudo systemctl enable redis-server
   ```
   Redis yalnızca 127.0.0.1 dinler (Ubuntu varsayılanı) — dışarı açma.
4. Kod: `git clone <repo> /home/ubuntu/arti && cd /home/ubuntu/arti/backend && npm ci --omit=dev`

## 3. Secrets — SSM Parameter Store
`.env` sunucuya elle yazılmaz; SSM'de `SecureString` olarak tutulur, deploy'da render edilir:
```bash
aws ssm put-parameter --name /arti/prod/JWT_SECRET --type SecureString --value "$(openssl rand -hex 48)"
aws ssm put-parameter --name /arti/prod/ENCRYPTION_KEY --type SecureString --value "$(openssl rand -hex 32)"
aws ssm put-parameter --name /arti/prod/WEBHOOK_SECRET --type SecureString --value "$(openssl rand -hex 32)"
aws ssm put-parameter --name /arti/prod/DESK360_WEBHOOK_TOKEN --type SecureString --value "$(openssl rand -hex 24)"
aws ssm put-parameter --name /arti/prod/MONGO_URI --type SecureString --value "mongodb+srv://..."
```
Sunucuda render: `bash deploy/render-env.sh` (EC2'nin IAM role'üne `ssm:GetParametersByPath` izni ver).
Sabit değerler render script'inde: `NODE_ENV=production`, `HOST=127.0.0.1`, `STORAGE_PROVIDER=s3`,
`REDIS_URL=redis://localhost:6379`, `ALLOWED_ORIGINS=https://artiapp.com.tr`, `PUBLIC_API_URL=https://api.artiapp.com.tr`.

> **ÖNEMLİ — ENCRYPTION_KEY:** Lokaldeki veriler lokal anahtarla şifreli. Üretim yeni
> anahtarla **boş veritabanı** üzerinde başlar; anahtar üretimde bir kez üretilir ve
> asla değiştirilmez (değişirse mevcut VKN'ler çözülemez). Anahtarın SSM dışında
> güvenli bir yedeği (örn. parola kasası) mutlaka olsun.

## 4. S3
1. Bucket: `arti-uploads-prod` (public access **kapalı**), bölge `eu-central-1`.
2. CORS (presigned PUT için):
   ```json
   [{ "AllowedMethods": ["PUT"], "AllowedOrigins": ["https://artiapp.com.tr"], "AllowedHeaders": ["Content-Type"] }]
   ```
3. EC2 IAM role'üne yalnızca bu bucket için `s3:PutObject` + `s3:GetObject` izni.
4. Görselleri servis etmek için CloudFront dağıtımı (origin: bucket, OAC ile) → `S3_PUBLIC_BASE`.
   CloudFront'suz hızlı başlangıç: bucket policy ile `GetObject` public yap, `S3_PUBLIC_BASE` boş bırak.

## 5. Nginx + TLS
```bash
sudo cp deploy/nginx.arti.conf /etc/nginx/sites-available/arti
sudo ln -s /etc/nginx/sites-available/arti /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl reload nginx
sudo snap install certbot --classic && sudo certbot --nginx -d api.artiapp.com.tr
```

## 6. Uygulama
```bash
cd /home/ubuntu/arti/backend
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup   # çıktısındaki komutu çalıştır (reboot'ta otomatik başlar)
pm2 install pm2-logrotate
curl -s https://api.artiapp.com.tr/healthz   # {"status":"ok","db":"up","redis":"up"}
```
Admin hesabı: `node scripts/createAdmin.js ops@artiapp.com.tr '<güçlü şifre>' superadmin`

## 7. CI/CD (GitHub Actions)
- `ci.yml` her push/PR'da Mongo+Redis servisleriyle iki e2e paketini koşar — **şimdiden aktif**.
- `deploy.yml` manuel tetiklenir (Actions → Deploy → Run workflow). Aktifleştirmek için repo
  Settings → Secrets'a ekle: `EC2_HOST` (Elastic IP), `EC2_SSH_KEY` (deploy kullanıcısının private key'i).

## 8. İzleme
- UptimeRobot: `https://api.artiapp.com.tr/healthz` — 1 dk aralık, keyword `"status":"ok"`.
- Loglar: `pm2 logs arti-api` (pino JSON). Sentry eklemek istersek `SENTRY_DSN` env'i Faz 4 işi.

## 9. Yük testi (k6)
```bash
brew install k6   # veya EC2'de: sudo snap install k6
K6_BASE=https://api.artiapp.com.tr K6_TOKEN=<user-jwt> K6_BOX_ID=<kutu-id> k6 run scripts/loadtest-checkout.js
```
Senaryo: 30 sn'de 50 sanal kullanıcıya rampa; hedef p95 < 500 ms, hata oranı < %1
(409 "tükendi" hata sayılmaz — stok atomikliğinin kanıtıdır). **Üretim DB'sinde değil,
staging/test verisiyle koş** — gerçek sipariş üretir.

## Yayın günü kontrol listesi
- [ ] Atlas IP allowlist'te yalnızca EC2 var
- [ ] `curl /healthz` → db up, redis up
- [ ] `NODE_ENV=production` (hata mesajları sızmıyor)
- [ ] Frontend `VITE_API_URL=https://api.artiapp.com.tr` ile build alındı
- [ ] Presign → S3 PUT → görsel CloudFront'tan açılıyor
- [ ] Webhook uçları imza/token olmadan 401 veriyor
- [ ] Auth rate limitleri aktif (dev'de kapalıdır; NODE_ENV=production ile otomatik açılır — 11. hatalı girişte 429 dönmeli)
- [ ] `pm2 startup` kayıtlı (reboot testi yap)
