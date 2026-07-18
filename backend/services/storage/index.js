// Dosya depolama adaptörü (PLAN.md §1) — sağlayıcı env ile seçilir:
//   STORAGE_PROVIDER=local → dosyalar backend/uploads altına yazılır (dev)
//   STORAGE_PROVIDER=s3    → AWS S3 presigned URL (üretim; S3_BUCKET + S3_REGION zorunlu)
// Her sağlayıcı aynı arayüzü sunar: presignUpload({ key, contentType }) →
//   { uploadUrl, method, headers, publicUrl, key, expiresInSec }
const env = require('../../config/env');

module.exports = env.storageProvider === 's3'
  ? require('./s3Provider')
  : require('./localProvider');
