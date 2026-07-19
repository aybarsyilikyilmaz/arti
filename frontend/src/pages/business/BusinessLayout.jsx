// İşletme paneli kabuğu: guard + sidebar + onay durumu banner'ı.
// İşletme profili (me) burada bir kez yüklenir, sayfalara Outlet context ile iner.
import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Settings, LogOut, Store, Hourglass } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as businessService from '../../services/businessService';
import { AdminBackdrop, Spinner, StatusBadge } from '../../components/admin/AdminUI';

const NAV = [
  { to: 'genel-bakis', label: 'Genel Bakış', icon: LayoutDashboard },
  { to: 'kutu', label: 'Kutu & Teslimat', icon: Package },
  { to: 'ayarlar', label: 'Ayarlar', icon: Settings },
];

export default function BusinessLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authed, restoring, logout } = useAuth('business');
  const [me, setMe] = useState(null);

  const reloadMe = useCallback(async () => {
    try { setMe(await businessService.getMe()); } catch { /* guard yakalar */ }
  }, []);

  useEffect(() => { if (authed) reloadMe(); }, [authed, reloadMe]);

  if (restoring) {
    return (
      <div className="font-admin relative flex min-h-screen items-center justify-center">
        <AdminBackdrop />
        <div className="relative flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-slate-500">Oturum doğrulanıyor…</p>
        </div>
      </div>
    );
  }

  if (!authed) return <Navigate to="/panel" replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/panel', { replace: true });
  };

  return (
    <div className="font-admin relative min-h-screen text-slate-200 antialiased">
      <AdminBackdrop />

      <div className="relative mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="sticky top-6 flex h-[calc(100vh-3rem)] w-16 shrink-0 flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-2xl shadow-[0_8px_40px_rgba(2,6,23,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] lg:w-64 lg:p-4"
        >
          {/* Marka + işletme adı */}
          <div className="mb-8 flex items-center gap-3 px-1 lg:px-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/40 blur-lg" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <Store className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-bold leading-tight tracking-tight text-white">
                {me?.name || 'İşletme Paneli'}
              </p>
              <p className="text-[11px] font-medium text-slate-500">Artı+ İşletme</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = location.pathname.endsWith(`/${to}`);
              return (
                <NavLink
                  key={to}
                  to={to}
                  className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out"
                >
                  {active && (
                    <motion.span
                      layoutId="biz-nav-pill"
                      transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                      className="absolute inset-0 rounded-xl border border-emerald-400/25 bg-emerald-500/[0.13] shadow-[0_0_24px_rgba(16,185,129,0.15),inset_0_1px_0_rgba(255,255,255,0.06)]"
                    />
                  )}
                  <Icon className={`relative z-10 h-[18px] w-[18px] shrink-0 transition-colors duration-300 ${active ? 'text-emerald-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className={`relative z-10 hidden transition-colors duration-300 lg:inline ${active ? 'text-emerald-200' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {label}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-white/[0.06] pt-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-300 ease-in-out hover:bg-rose-500/10 hover:text-rose-300 active:scale-95"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span className="hidden lg:inline">Çıkış Yap</span>
            </button>
          </div>
        </motion.aside>

        {/* İçerik */}
        <main className="min-w-0 flex-1">
          {/* Onay bekliyor / askıda uyarısı */}
          {me && me.status !== 'APPROVED' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-5 py-4 backdrop-blur-xl"
            >
              <Hourglass className="h-5 w-5 shrink-0 text-amber-400" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-300">
                  {me.status === 'PENDING_APPROVAL' ? 'Başvurun inceleniyor' : 'Hesabın askıya alındı'}
                </p>
                <p className="mt-0.5 text-xs text-amber-200/60">
                  {me.status === 'PENDING_APPROVAL'
                    ? 'Ekibimiz vergi bilgilerini doğruladıktan sonra kutu yayınlayabileceksin. Ayarlarını şimdiden yapabilirsin.'
                    : 'Kutu yayınlama kapalı. Destek için bizimle iletişime geç.'}
                </p>
              </div>
              <StatusBadge status={me.status} pulse={me.status === 'PENDING_APPROVAL'} />
            </motion.div>
          )}

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet context={{ me, reloadMe }} />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
