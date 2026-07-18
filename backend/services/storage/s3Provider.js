// AWS S3 presigned upload — üretim sağlayıcısı (PLAN.md §1, Faz 3).
// Kimlik bilgileri AWS default chain'den gelir (EC2'de IAM instance role önerilir;
// erişim anahtarı .env'e yazılmaz). Bucket public-read DEĞİLDİR; görseller
// S3_PUBLIC_BASE (CloudFront/CDN) üzerinden servis edilir, yoksa S3 URL'i kullanılır.
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const env = require('../../config/env');

const EXPIRES_IN_SEC = 300;

let client;
function getClient() {
  if (!client) client = new S3Client({ region: env.s3Region });
  return client;
}

function publicUrlFor(key) {
  const base = env.s3PublicBase || `https://${env.s3Bucket}.s3.${env.s3Region}.amazonaws.com`;
  return `${base.replace(/\/$/, '')}/${key}`;
}

async function presignUpload({ key, contentType }) {
  const command = new PutObjectCommand({
    Bucket: env.s3Bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: EXPIRES_IN_SEC });
  return {
    uploadUrl,
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    publicUrl: publicUrlFor(key),
    key,
    expiresInSec: EXPIRES_IN_SEC,
  };
}

// S3 modunda lokal PUT rotası kullanılmaz
async function saveUpload() {
  const err = new Error('Lokal yükleme S3 modunda kapalıdır.');
  err.status = 404;
  throw err;
}

function ownsPublicUrl(url) {
  if (typeof url !== 'string') return false;
  const base = env.s3PublicBase || `https://${env.s3Bucket}.s3.${env.s3Region}.amazonaws.com`;
  return url.startsWith(`${base.replace(/\/$/, '')}/`);
}

module.exports = { presignUpload, saveUpload, ownsPublicUrl };
