// Kullanıcı uygulaması API çağrıları — /api/v1 kullanıcı uçlarıyla birebir.
import axios from 'axios';
import { api } from './api';

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/v1`;

// Kayıt (login'i api.js'teki ortak login('user', ...) yapar)
export const register = (payload) =>
  axios.post(`${BASE_URL}/users/register`, payload, { withCredentials: true }).then((r) => r.data);

// Bugünün kutuları (herkese açık; konum verilirse yakınlık sıralı)
export const listBoxes = (params = {}) =>
  api.get('/boxes', { params }).then((r) => r.data.data.boxes);

// Rezervasyon → { orderId, amount, paymentPageUrl, expiresInMinutes }
export const checkout = (boxId) =>
  api.post('/orders/checkout', { boxId }).then((r) => r.data.data);

// Mock ödeme tamamlama (yalnızca dev — gerçek sağlayıcıda ödeme sayfasına gidilir)
export const completeMockPayment = (paymentRef, success = true) =>
  api.post('/payments/mock/complete', { paymentRef, success }).then((r) => r.data);

export const myOrders = () =>
  api.get('/orders/mine').then((r) => r.data.data.orders);

// Favoriler
export const listFavorites = () =>
  api.get('/users/favorites').then((r) => r.data.data.favorites);

export const addFavorite = (businessId) =>
  api.post(`/users/favorites/${businessId}`).then((r) => r.data);

export const removeFavorite = (businessId) =>
  api.delete(`/users/favorites/${businessId}`).then((r) => r.data);

// Bildirimler
export const listNotifications = () =>
  api.get('/users/notifications').then((r) => r.data); // {unreadCount, data:{notifications}}

export const markNotificationsRead = () =>
  api.patch('/users/notifications/read').then((r) => r.data);
