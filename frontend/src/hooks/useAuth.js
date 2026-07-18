// Rol bazlı oturum hook'u — api.js'teki bellek içi oturumu React'e bağlar.
// İlk mount'ta httpOnly refresh cookie'siyle sessiz oturum kurtarma dener;
// `restoring` true iken guard'lar login'e YÖNLENDİRMEMELİ (splash gösterilir).
import { useEffect, useState, useCallback } from 'react';
import {
  getSession, subscribeSession, restoreSession,
  login as apiLogin, logout as apiLogout,
} from '../services/api';

export function useAuth(role) {
  const [session, setSess] = useState(getSession());
  const [restoring, setRestoring] = useState(!getSession().accessToken);

  useEffect(() => subscribeSession(setSess), []);

  useEffect(() => {
    if (getSession().accessToken) { setRestoring(false); return; }
    let alive = true;
    restoreSession(role).finally(() => { if (alive) setRestoring(false); });
    return () => { alive = false; };
  }, [role]);

  const login = useCallback((credentials) => apiLogin(role, credentials), [role]);
  const logout = useCallback(() => apiLogout(), []);

  return {
    authed: session.role === role && Boolean(session.accessToken),
    restoring,
    login,
    logout,
  };
}
