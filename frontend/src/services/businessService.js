// İşletme paneli API çağrıları — backend /api/v1/business/* uçlarıyla birebir.
import { api, setSession } from './api';

// Profil
export const getMe = () =>
  api.get('/business/me').then((r) => r.data.data);

// Çalışan / Ekip Yönetimi
export const getEmployees = () =>
  api.get('/business/employees').then((r) => r.data.data.employees);

export const createEmployee = (payload) =>
  api.post('/business/employees', payload).then((r) => r.data.data.employee);

export const updateEmployee = (id, payload) =>
  api.patch(`/business/employees/${id}`, payload).then((r) => r.data.data.employee);

export const deleteEmployee = (id) =>
  api.delete(`/business/employees/${id}`).then((r) => r.data);

export const updateProfile = (payload) =>
  api.patch('/business/profile', payload).then((r) => r.data);

export const updateProfileRequest = (payload) =>
  api.post('/business/profile/update-request', payload).then((r) => r.data);

// Destek / Bilet Sistemi
export const listTickets = () =>
  api.get('/tickets').then((r) => r.data.data.tickets);

export const createTicket = (payload) =>
  api.post('/tickets', payload).then((r) => r.data.data.ticket);

export const addTicketMessage = (id, message) =>
  api.post(`/tickets/${id}/messages`, { message }).then((r) => r.data.data.ticket);

export const closeTicket = (id) =>
  api.patch(`/tickets/${id}/close`).then((r) => r.data.data.ticket);

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

// FİNANS & ÖDEMELER
export const getFinanceOverview = () =>
  api.get('/business/finance/overview').then((r) => r.data.data);

export const getPayouts = (page = 1) =>
  api.get('/business/finance/payouts', { params: { page } }).then((r) => r.data.data);

export const updateIban = (data) =>
  api.put('/business/finance/iban', data).then((r) => r.data.data);

// Bildirimler
export const getNotifications = () =>
  api.get('/business/notifications').then((r) => r.data.data);

export const markNotificationAsRead = (id) =>
  api.patch(`/business/notifications/${id}/read`).then((r) => r.data.data);

export const markAllNotificationsAsRead = () =>
  api.patch('/business/notifications/read-all').then((r) => r.data);

// Son siparişler: aktivite akışı (Genel Bakış sayfası)
export const getRecentOrders = () =>
  api.get('/business/orders/recent').then((r) => r.data.data.orders);

// Tüm siparişler: sayfalı liste (Siparişlerim sayfası)
export const getAllOrders = (page = 1, limit = 20) =>
  api.get('/business/orders', { params: { page, limit } }).then((r) => r.data.data);

// Müşteri değerlendirmeleri (ortalama puan + son yorumlar)
export const getReviews = () =>
  api.get('/business/reviews').then((r) => r.data.data);

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

// Şube (Zincir) Yönetimi
export const getBranches = () =>
  api.get('/business/branches').then((r) => r.data.data);

export const createBranch = (payload) =>
  api.post('/business/branches', payload).then((r) => r.data);

export const switchBranch = async (targetId) => {
  const res = await api.post('/business/switch-branch', { targetId }).then((r) => r.data);
  setSession('business', res.accessToken);
  return res;
};

// Oturumlar & Güvenlik
export const getSessions = () =>
  api.get('/business/sessions').then((r) => r.data.sessions);

export const revokeSession = (deviceId) =>
  api.delete(`/business/sessions/${deviceId}`).then((r) => r.data);

export const revokeAllSessions = () =>
  api.delete('/business/sessions/all').then((r) => r.data);

export const changePassword = (payload) =>
  api.post('/business/change-password', payload).then((r) => r.data);
