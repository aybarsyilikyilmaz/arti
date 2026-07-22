// Admin paneli API çağrıları — backend /api/v1/admin/* uçlarıyla birebir.
import { api } from './api';

// İşletme onay akışı
export const listBusinesses = (params) =>
  api.get('/admin/businesses', { params }).then((r) => r.data); // {total, data:{businesses}}

export const createBusiness = (payload) =>
  api.post('/admin/businesses', payload).then((r) => r.data.data.business);

export const getBusinessDetail = (id) =>
  api.get(`/admin/businesses/${id}`).then((r) => r.data.data.business); // VKN burada çözülür

export const approveBusiness = (id) =>
  api.patch(`/admin/businesses/${id}/approve`).then((r) => r.data);

export const suspendBusiness = (id) =>
  api.patch(`/admin/businesses/${id}/suspend`).then((r) => r.data);

export const approveProfileUpdate = (id) =>
  api.post(`/admin/businesses/${id}/approve-update`).then((r) => r.data);

export const rejectProfileUpdate = (id, reason) =>
  api.post(`/admin/businesses/${id}/reject-update`, { reason }).then((r) => r.data);

// Destek / Bilet Yönetimi
export const listTickets = (params) =>
  api.get('/admin/tickets', { params }).then((r) => r.data);

export const getTicket = (id) =>
  api.get(`/admin/tickets/${id}`).then((r) => r.data.data.ticket);

export const replyTicket = (id, message) =>
  api.post(`/admin/tickets/${id}/reply`, { message }).then((r) => r.data);

export const updateTicketStatus = (id, status) =>
  api.patch(`/admin/tickets/${id}/status`, { status }).then((r) => r.data);

// Sipariş iadesi
export const refundOrder = (orderId) =>
  api.post(`/admin/orders/${orderId}/refund`).then((r) => r.data);

// --- İşletme Detay sayfası (impersonation'sız tam yönetim) ---
export const getBusinessDetailFull = (id) =>
  api.get(`/admin/businesses/${id}`).then((r) => r.data.data); // {business, stats}

export const updateBusinessProfile = (id, payload) =>
  api.patch(`/admin/businesses/${id}/profile`, payload).then((r) => r.data);

export const listBusinessOrders = (id, params) =>
  api.get(`/admin/businesses/${id}/orders`, { params }).then((r) => r.data.data);

export const listBusinessBoxes = (id) =>
  api.get(`/admin/businesses/${id}/boxes`).then((r) => r.data.data); // {today, todayBox, recentBoxes}

export const patchTodayBox = (id, payload) =>
  api.patch(`/admin/businesses/${id}/boxes/today`, payload).then((r) => r.data);

export const getBusinessFinance = (id, params) =>
  api.get(`/admin/businesses/${id}/finance`, { params }).then((r) => r.data.data);

export const updatePayoutStatus = (payoutId, status, reference) =>
  api.patch(`/admin/payouts/${payoutId}`, { status, ...(reference ? { reference } : {}) }).then((r) => r.data);

// Admin, işletme adına vitrin görseli yükler (presign → PUT → publicUrl)
export const uploadBusinessImage = async (id, kind, file) => {
  const grant = await api
    .post(`/admin/businesses/${id}/uploads/presign`, { kind, contentType: file.type })
    .then((r) => r.data.data);
  const put = await fetch(grant.uploadUrl, { method: 'PUT', headers: grant.headers, body: file });
  if (!put.ok) throw new Error('Görsel yüklenemedi.');
  return grant.publicUrl;
};

export const setBusinessImages = (id, payload) =>
  api.patch(`/admin/businesses/${id}/profile/images`, payload).then((r) => r.data);

export const listBusinessEmployees = (id) =>
  api.get(`/admin/businesses/${id}/employees`).then((r) => r.data.data); // {employees, branches}

export const updateEmployee = (employeeId, payload) =>
  api.patch(`/admin/employees/${employeeId}`, payload).then((r) => r.data);

export const deleteEmployee = (employeeId) =>
  api.delete(`/admin/employees/${employeeId}`).then((r) => r.data);

// --- Platform geneli (Dashboard / Siparişler / Kullanıcılar / Finans / Yorumlar) ---
export const getDashboard = () =>
  api.get('/admin/dashboard').then((r) => r.data.data); // {metrics, daily, alarms}

export const listAllOrders = (params) =>
  api.get('/admin/orders', { params }).then((r) => r.data.data);

export const listUsers = (params) =>
  api.get('/admin/users', { params }).then((r) => r.data.data);

export const getUserDetail = (id) =>
  api.get(`/admin/users/${id}`).then((r) => r.data.data); // {user, record, recentOrders}

export const banUser = (id) =>
  api.patch(`/admin/users/${id}/ban`).then((r) => r.data);

export const unbanUser = (id) =>
  api.patch(`/admin/users/${id}/unban`).then((r) => r.data);

export const getPlatformFinance = () =>
  api.get('/admin/finance/overview').then((r) => r.data.data); // {rows, totals, recentPayouts}

export const createPayout = (businessId, reference) =>
  api.post('/admin/finance/payouts', { businessId, ...(reference ? { reference } : {}) }).then((r) => r.data);

export const listReviews = (params) =>
  api.get('/admin/reviews', { params }).then((r) => r.data.data);

export const deleteReview = (id) =>
  api.delete(`/admin/reviews/${id}`).then((r) => r.data);
// ... mevcut dosyanın en altına eklenecek ...
export const getPlatformSettings = () => api.get('/admin/settings').then(r => r.data);
export const updatePlatformSettings = (markupRate) => api.patch('/admin/settings', { markupRate }).then(r => r.data);

// Aktivite logu — işletme değişiklikleri (izleme)
export const getActivity = (params) =>
  api.get('/admin/activity', { params }).then((r) => r.data.data); // {logs, pagination}
