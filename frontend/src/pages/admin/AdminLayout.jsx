// Admin paneli kabuğu: oturum guard'ı + cam sidebar + içerik alanı.
// Aktif menü pili framer-motion layoutId ile sekmeler arasında süzülür.
import React from 'react';
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MessageCircle, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AdminBackdrop, Spinner } from '../../components/admin/AdminUI';

const NAV = [
  { to: 'isletmeler', label: 'İşletme Onayları', icon: Building2 },
  { to: 'whatsapp', label: 'WhatsApp Kuyruğu', icon: MessageCircle },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authed, restoring, logout } = useAuth('admin');

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

  if (!authed) return <Navigate to="/admin" replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/admin', { replace: true });
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
          {/* Marka */}
          <div className="mb-8 flex items-center gap-3 px-1 lg:px-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-indigo-500/40 blur-lg" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold leading-tight tracking-tight text-white">
                Artı<span className="text-indigo-400">+</span> Yönetim
              </p>
              <p className="text-[11px] font-medium text-slate-500">Süper Admin</p>
            </div>
          </div>

          {/* Menü — aktif pil sekmeler arasında süzülür */}
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
                      layoutId="admin-nav-pill"
                      transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                      className="absolute inset-0 rounded-xl border border-indigo-400/25 bg-indigo-500/[0.14] shadow-[0_0_24px_rgba(99,102,241,0.15),inset_0_1px_0_rgba(255,255,255,0.06)]"
                    />
                  )}
                  <Icon className={`relative z-10 h-[18px] w-[18px] shrink-0 transition-colors duration-300 ${active ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className={`relative z-10 hidden transition-colors duration-300 lg:inline ${active ? 'text-indigo-200' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {label}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Alt bölüm */}
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
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
