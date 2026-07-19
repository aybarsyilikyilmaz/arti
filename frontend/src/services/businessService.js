// İşletme paneli API çağrıları — backend /api/v1/business/* uçlarıyla birebir.
import { api } from './api';

// Profil
export const getMe = () =>
  api.get('/business/me').then((r) => r.data.data.business);

export const updateProfile = (payload) =>
  api.patch('/business/profile', payload).then((r) => r.data);

// Bugünün kutusu
export const getTodayBox = () =>
  api.get('/business/boxes/today').then((r) => r.data.data.box); // yoksa null

export const upsertTodayBox = (payload) =>
  api.post('/business/boxes', payload).then((r) => r.data.data.box);

// QR teslim onayı — 409'lar da anlamlı Türkçe mesaj taşır
export const verifyPickup = (qrToken) =>
  api.post('/business/orders/verify', { qrToken }).then((r) => r.data);

// Rapor: bugün + son N gün ciro/sipariş (PLAN.md Faz 4)
export const getSummary = (days = 7) =>
  api.get('/business/reports/summary', { params: { days } }).then((r) => r.data.data);

// Vitrin görselleri — presigned akış: izin al → dosyayı doğrudan depoya PUT et
// (lokalde API'ye, üretimde S3'e; istemci tarafında hiçbir fark yok)
export const uploadImage = async (kind, file) => {
  const grant = await api
    .post('/business/uploads/presign', { kind, contentType: file.type })
    .then((r) => r.data.data);
  const put = await fetch(grant.uploadUrl, { method: 'PUT', headers: grant.headers, body: file });
  if (!put.ok) throw new Error('Görsel yüklenemedi.');
  return grant.publicUrl;
};

export const setImages = (payload) =>
  api.patch('/business/profile/images', payload).then((r) => r.data);
