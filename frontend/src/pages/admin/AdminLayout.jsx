// Admin paneli kabuğu: oturum guard'ı + sidebar + içerik alanı.
// İşletme paneliyle birebir aynı aydınlık tema (bg-gray-50, beyaz sidebar,
// zümrüt vurgu). Aktif menü pili framer-motion layoutId ile süzülür.
import React from 'react';
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building2, ShoppingBag, Users, Banknote, Star,
  MessageCircle, LogOut, ShieldCheck, LifeBuoy
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/admin/AdminUI';

const NAV = [
  { to: 'genel-bakis', label: 'Genel Bakış', icon: LayoutDashboard },
  { to: 'isletmeler', label: 'İşletmeler', icon: Building2 },
  { to: 'siparisler', label: 'Siparişler', icon: ShoppingBag },
  { to: 'kullanicilar', label: 'Kullanıcılar', icon: Users },
  { to: 'finans', label: 'Finans & Hakediş', icon: Banknote },
  { to: 'yorumlar', label: 'Yorumlar', icon: Star },
  { to: 'destek', label: 'Destek', icon: LifeBuoy },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authed, restoring, logout } = useAuth('admin');

  if (restoring) {
    return (
      <div className="font-admin flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-gray-400">Oturum doğrulanıyor…</p>
        </div>
      </div>
    );
  }

  // Giriş tek kapıdan: /business formu admin hesabını tanıyıp buraya getirir
  if (!authed) return <Navigate to="/business" state={{ mode: 'login' }} replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/business', { state: { mode: 'login' }, replace: true });
  };

  return (
    <div className="font-admin relative min-h-screen bg-gray-50 text-gray-900 antialiased">
      <div className="relative mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="sticky top-6 flex h-[calc(100vh-3rem)] w-16 shrink-0 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-xl shadow-gray-200/60 lg:w-64 lg:p-4"
        >
          {/* Marka */}
          <div className="mb-8 flex items-center gap-3 px-1 lg:px-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold leading-tight tracking-tight text-gray-900">
                Artı<span className="text-emerald-600">+</span> Yönetim
              </p>
              <p className="text-[11px] font-medium text-gray-400">Süper Admin</p>
            </div>
          </div>

          {/* Menü — aktif pil sekmeler arasında süzülür */}
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              // includes: /isletmeler/:id detay sayfasında da menü aktif kalsın
              const active = location.pathname.split('/').includes(to);
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
                      className="absolute inset-0 rounded-xl border border-emerald-200 bg-emerald-50"
                    />
                  )}
                  <Icon className={`relative z-10 h-[18px] w-[18px] shrink-0 transition-colors duration-300 ${
                    active ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <span className={`relative z-10 hidden transition-colors duration-300 lg:inline ${
                    active ? 'text-emerald-700' : 'text-gray-500 group-hover:text-gray-800'
                  }`}>
                    {label}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-gray-100 pt-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-all duration-300 ease-in-out hover:bg-rose-50 hover:text-rose-500 active:scale-95"
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
