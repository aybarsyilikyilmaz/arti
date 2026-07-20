// Müşteri (son kullanıcı) API katmanı — backend /users/*, /boxes, /orders/* ile
// birebir. Kimlik akışı ortak api.js interceptor'ından geçer (access token
// bellekte, refresh httpOnly cookie). Fiyat/stok gibi kritik alanlar her zaman
// sunucudan gelir; istemci bunları ASLA belirlemez (fiyat manipülasyonu koruması).
import { api, login as apiLogin, logout as apiLogout, setSession } from './api';

// --- Kimlik ---
export const register = async (payload) => {
  const res = await api.post('/users/register', payload);
  // Kayıt sonrası backend token dönebilir; dönmezse çağıran login'e yönlendirir
  if (res.data?.accessToken) setSession('user', res.data.accessToken);
  return res.data;
};

export const login = (credentials) => apiLogin('user', credentials);
export const logout = () => apiLogout();

// --- Keşfet: yakındaki bugünün kutuları ---
// Koordinat verilirse yakınlık sıralı; verilmezse genel liste.
export const listBoxes = (params = {}) =>
  api.get('/boxes', { params }).then((r) => r.data.data.boxes);

export const getBox = (id) =>
  api.get(`/boxes/${id}`).then((r) => r.data.data.box);

// --- Sipariş akışı ---
// checkout yalnızca boxId gönderir — tutarı sunucu kutudan hesaplar.
export const checkout = (boxId) =>
  api.post('/orders/checkout', { boxId }).then((r) => r.data.data);

// Mock ödeme tamamlama (yalnızca dev; gerçek sağlayıcıda ödeme sayfasına gidilir).
export const completeMockPayment = (paymentRef, success = true) =>
  api.post('/payments/mock/complete', { paymentRef, success }).then((r) => r.data);

export const myOrders = () =>
  api.get('/orders/mine').then((r) => r.data.data.orders);

export const submitReview = (payload) =>
  api.post('/orders/review', payload).then((r) => r.data);

// --- Profil ---
export const getMe = () =>
  api.get('/users/me').then((r) => r.data.data.user);

// --- Favoriler ---
export const listFavorites = () =>
  api.get('/users/favorites').then((r) => r.data.data.favorites);

export const addFavorite = (businessId) =>
  api.post(`/users/favorites/${businessId}`).then((r) => r.data);

export const removeFavorite = (businessId) =>
  api.delete(`/users/favorites/${businessId}`).then((r) => r.data);

// --- Bildirimler ---
export const listNotifications = () =>
  api.get('/users/notifications').then((r) => r.data);
