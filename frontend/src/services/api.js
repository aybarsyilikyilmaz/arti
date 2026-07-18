// Merkezi API katmanı — tek axios instance, üç rol (admin | business | user).
//
// Güvenlik modeli (backend PLAN.md §5 ile birebir):
//  - Access token YALNIZCA bellekte tutulur (localStorage yok → XSS'te çalınacak
//    kalıcı token yok). Sayfa yenilenince kaybolur; httpOnly refresh cookie'siyle
//    sessizce geri alınır (bkz. restoreSession).
//  - 401 gelen istek, role uygun /refresh ucuna gidip yeni access token alır ve
//    orijinal istek BİR kez tekrarlanır. Refresh de düşerse oturum kapanır.
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/api/v1`;

// Rol → auth uçlarının yolu (backend rota önekleri)
const ROLE_PREFIX = { admin: 'admin', business: 'business', user: 'users' };

// --- Bellek içi oturum durumu ---
let session = { role: null, accessToken: null };
const listeners = new Set();

export function getSession() {
  return session;
}

export function setSession(role, accessToken) {
  session = { role, accessToken };
  listeners.forEach((fn) => fn(session));
}

export function clearSession() {
  session = { role: null, accessToken: null };
  listeners.forEach((fn) => fn(session));
}

// React tarafı oturum değişikliklerine abone olur (useAuth hook'u kullanır)
export function subscribeSession(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // httpOnly refresh cookie'leri için zorunlu
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (session.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Eşzamanlı 401'lerde tek refresh isteği atılır; diğerleri onu bekler
let refreshPromise = null;

async function refreshAccessToken(role) {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${BASE_URL}/${ROLE_PREFIX[role]}/refresh`, null, { withCredentials: true })
      .then((res) => {
        setSession(role, res.data.accessToken);
        return res.data.accessToken;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // 401 + rol belli + henüz tekrarlanmamış + refresh çağrısının kendisi değil
    if (status === 401 && session.role && !original._retried && !original.url?.endsWith('/refresh')) {
      original._retried = true;
      try {
        const token = await refreshAccessToken(session.role);
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        clearSession(); // refresh de düştü → oturum bitti, guard login'e yönlendirir
      }
    }
    return Promise.reject(error);
  }
);

// Sayfa açılışında sessiz oturum kurtarma: cookie varsa token alınır, yoksa sessizce geçilir
export async function restoreSession(role) {
  try {
    const res = await axios.post(`${BASE_URL}/${ROLE_PREFIX[role]}/refresh`, null, { withCredentials: true });
    setSession(role, res.data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export async function login(role, credentials) {
  const res = await axios.post(`${BASE_URL}/${ROLE_PREFIX[role]}/login`, credentials, { withCredentials: true });
  setSession(role, res.data.accessToken);
  return res.data;
}

export async function logout() {
  const role = session.role;
  clearSession();
  if (role) {
    try { await axios.post(`${BASE_URL}/${ROLE_PREFIX[role]}/logout`, null, { withCredentials: true }); } catch { /* oturum zaten kapalı */ }
  }
}

// Backend'in Türkçe hata mesajını çıkarır; ağ hatasında genel mesaj döner
export function apiErrorMessage(error, fallback = 'Bir şeyler ters gitti. Lütfen tekrar deneyin.') {
  return error?.response?.data?.message
    || (Array.isArray(error?.response?.data?.errors) ? error.response.data.errors[0] : null)
    || fallback;
}
