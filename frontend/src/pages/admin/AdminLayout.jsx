// Admin paneli kabuğu: oturum guard'ı + cam sidebar + içerik alanı.
// restoring sırasında yönlendirme YAPILMAZ (sayfa yenilemede oturum cookie'den döner).
import React from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MessageCircle, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/admin/AdminUI';

const NAV = [
  { to: 'isletmeler', label: 'İşletme Onayları', icon: Building2 },
  { to: 'whatsapp', label: 'WhatsApp Kuyruğu', icon: MessageCircle },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { authed, restoring, logout } = useAuth('admin');

  if (restoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1f17]">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-white/40">Oturum doğrulanıyor…</p>
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
    <div className="relative min-h-screen bg-[#0b1f17] text-white">
      {/* Arka plan dokusu */}
      <div className="pointer-events-none fixed -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-brand/25 blur-[140px]" />
      <div className="pointer-events-none fixed -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-[120px]" />

      <div className="relative mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="sticky top-6 flex h-[calc(100vh-3rem)] w-16 shrink-0 flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-xl lg:w-64 lg:p-4"
        >
          <div className="mb-8 flex items-center gap-3 px-1 lg:px-2">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-2">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold leading-tight">Artı<span className="text-emerald-400">+</span> Yönetim</p>
              <p className="text-[11px] text-white/40">Süper Admin</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'border border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                      : 'border border-transparent text-white/50 hover:bg-white/5 hover:text-white/80'
                  }`
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="hidden lg:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 transition hover:bg-rose-400/10 hover:text-rose-300"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span className="hidden lg:inline">Çıkış Yap</span>
          </button>
        </motion.aside>

        {/* İçerik */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
