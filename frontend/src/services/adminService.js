// Admin paneli API çağrıları — backend /api/v1/admin/* uçlarıyla birebir.
import { api } from './api';

// İşletme onay akışı
export const listBusinesses = (params) =>
  api.get('/admin/businesses', { params }).then((r) => r.data); // {total, data:{businesses}}

export const getBusinessDetail = (id) =>
  api.get(`/admin/businesses/${id}`).then((r) => r.data.data.business); // VKN burada çözülür

export const approveBusiness = (id) =>
  api.patch(`/admin/businesses/${id}/approve`).then((r) => r.data);

export const suspendBusiness = (id) =>
  api.patch(`/admin/businesses/${id}/suspend`).then((r) => r.data);

// WhatsApp otomasyon kuyruğu (PENDING_REVIEW çözümleme)
export const listOutreach = (params) =>
  api.get('/admin/outreach', { params }).then((r) => r.data); // {total, data:{logs}}

export const applyOutreach = (id, count) =>
  api.patch(`/admin/outreach/${id}/apply`, { count }).then((r) => r.data);

export const dismissOutreach = (id) =>
  api.patch(`/admin/outreach/${id}/dismiss`).then((r) => r.data);

// Sipariş iadesi
export const refundOrder = (orderId) =>
  api.post(`/admin/orders/${orderId}/refund`).then((r) => r.data);
