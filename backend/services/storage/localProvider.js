// Lokal depolama — S3 presigned akışının birebir simülasyonu.
// presignUpload, HMAC imzalı + süreli bir PUT URL'i üretir; istemci dosyayı
// o URL'e PUT eder (bkz. uploadController.putLocal), dosya uploads/ altına yazılır
// ve /uploads/<key> üzerinden statik servis edilir. Üretimde s3Provider'a
// geçildiğinde istemci tarafında hiçbir şey değişmez.
const path = require('path');
const fs = require('fs/promises');
const env = require('../../config/env');
const { hmacSign, hmacVerify } = require('../../utils/crypto');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const EXPIRES_IN_SEC = 300;

// Key yalnızca güvenli karakterler içerebilir — path traversal imkânsız
const SAFE_KEY = /^[a-zA-Z0-9/_.-]+$/;

function assertSafeKey(key) {
  if (!SAFE_KEY.test(key) || key.includes('..') || key.startsWith('/')) {
    const err = new Error('Geçersiz dosya anahtarı.');
    err.status = 400;
    throw err;
  }
}

function signPayload(key, contentType, exp) {
  return hmacSign(`upload.${key}.${contentType}.${exp}`);
}

async function presignUpload({ key, contentType }) {
  assertSafeKey(key);
  const exp = Math.floor(Date.now() / 1000) + EXPIRES_IN_SEC;
  const sig = signPayload(key, contentType, exp);
  const qs = new URLSearchParams({ exp: String(exp), ct: contentType, sig });
  return {
    uploadUrl: `${env.publicApiUrl}/api/v1/uploads/local/${key}?${qs}`,
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    publicUrl: `${env.publicApiUrl}/uploads/${key}`,
    key,
    expiresInSec: EXPIRES_IN_SEC,
  };
}

// PUT rotası tarafından çağrılır — imza ve süre doğrulanmadan dosya yazılmaz
async function saveUpload({ key, contentType, exp, sig, body }) {
  assertSafeKey(key);
  const expNum = parseInt(exp, 10);
  if (!expNum || expNum < Math.floor(Date.now() / 1000)) {
    const err = new Error('Yükleme bağlantısının süresi dolmuş.');
    err.status = 403;
    throw err;
  }
  if (!sig || !hmacVerify(`upload.${key}.${contentType}.${expNum}`, sig)) {
    const err = new Error('Geçersiz yükleme imzası.');
    err.status = 403;
    throw err;
  }
  const filePath = path.join(UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, body);
  return { publicUrl: `${env.publicApiUrl}/uploads/${key}` };
}

// publicUrl bizim depomuza mı ait? (profil güncellemede keyfi URL enjeksiyonunu engeller)
function ownsPublicUrl(url) {
  return typeof url === 'string' && url.startsWith(`${env.publicApiUrl}/uploads/`);
}

module.exports = { presignUpload, saveUpload, ownsPublicUrl, UPLOAD_DIR };
