// Kullanıcı uygulaması kabuğu — mobil görünümlü web app (max-w-md, alt tab bar).
// Keşfet herkese açıktır; diğer sekmeler girişte /app/giris'e yönlendirir.
import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, ShoppingBag, Heart, Bell, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as userService from '../../services/userService';
import { AdminBackdrop } from '../../components/admin/AdminUI';

const TABS = [
  { to: '/app', end: true, label: 'Keşfet', icon: Compass, guarded: false },
  { to: '/app/siparisler', label: 'Siparişler', icon: ShoppingBag, guarded: true },
  { to: '/app/favoriler', label: 'Favoriler', icon: Heart, guarded: true },
  { to: '/app/bildirimler', label: 'Bildirim', icon: Bell, guarded: true, badge: true },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authed, restoring, logout } = useAuth('user');
  const [unread, setUnread] = useState(0);

  const refreshBadge = useCallback(async () => {
    if (!authed) { setUnread(0); return; }
    try {
      const res = await userService.listNotifications();
      setUnread(res.unreadCount || 0);
    } catch { /* rozet kritik değil */ }
  }, [authed]);

  useEffect(() => { refreshBadge(); }, [refreshBadge, location.pathname]);

  const go = (tab) => (e) => {
    if (tab.guarded && !authed && !restoring) {
      e.preventDefault();
      navigate('/app/giris');
    }
  };

  return (
    <div className="font-admin relative min-h-screen text-slate-200 antialiased">
      <AdminBackdrop />

      {/* Telefon genişliğinde kolon */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col">
        {/* Üst bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-[#070b14]/70 px-5 py-4 backdrop-blur-2xl">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-emerald-500/40 blur-md" />
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                +
              </div>
            </div>
            <p className="text-base font-bold tracking-tight text-white">
              Artı<span className="text-emerald-400">+</span>
            </p>
          </div>

          {authed ? (
            <button
              onClick={async () => { await logout(); navigate('/app'); }}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-400 transition-all duration-300 hover:text-rose-300 active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" /> Çıkış
            </button>
          ) : (
            <button
              onClick={() => navigate('/app/giris')}
              className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-emerald-950 shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-all duration-300 hover:bg-emerald-400 active:scale-95"
            >
              <UserRound className="h-3.5 w-3.5" /> Giriş Yap
            </button>
          )}
        </header>

        {/* İçerik */}
        <main className="flex-1 px-4 pb-28 pt-5">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet context={{ authed, restoring, refreshBadge }} />
          </motion.div>
        </main>

        {/* Alt tab bar */}
        <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 pb-4">
          <div className="flex items-center justify-around rounded-2xl border border-white/10 bg-[#0a101f]/85 px-2 py-2 backdrop-blur-2xl shadow-[0_-8px_40px_rgba(2,6,23,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                onClick={go(tab)}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 transition-all duration-300 ease-in-out active:scale-95 ${
                    isActive ? 'text-emerald-300' : 'text-slate-500 hover:text-slate-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="app-tab-pill"
                        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                        className="absolute inset-0 rounded-xl bg-emerald-500/[0.12] ring-1 ring-inset ring-emerald-400/20"
                      />
                    )}
                    <span className="relative">
                      <tab.icon className="h-5 w-5" />
                      {tab.badge && unread > 0 && (
                        <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-[0_0_12px_rgba(244,63,94,0.6)]">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </span>
                    <span className="relative text-[10px] font-semibold">{tab.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
