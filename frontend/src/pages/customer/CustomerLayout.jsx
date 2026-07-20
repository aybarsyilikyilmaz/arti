// Müşteri web uygulaması kabuğu — TAM RESPONSIVE (telefon çerçevesi YOK).
// Masaüstünde geniş header + arama; mobilde sadeleşir. Keşfet herkese açıktır;
// sipariş/siparişlerim gibi işlemler girişi tetikler (alt sayfalar yönlendirir).
// Oturum ortak api.js akışından gelir (access token bellekte, refresh cookie).
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, ShoppingBag, Heart, User, LogOut, Menu, X, Leaf } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Basit konum seçenekleri (Faz 2'de keşfet filtresini besler)
const LOCATIONS = ['Kadıköy, İstanbul', 'Beşiktaş, İstanbul', 'Şişli, İstanbul', 'Çankaya, Ankara', 'Konak, İzmir'];

export default function CustomerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authed, restoring, logout } = useAuth('user');

  const [query, setQuery] = useState('');
  const [loc, setLoc] = useState(LOCATIONS[0]);
  const [menuOpen, setMenuOpen] = useState(false);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/kesfet?q=${encodeURIComponent(query.trim())}`);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/kesfet');
  };

  if (restoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Leaf className="h-8 w-8 animate-pulse text-emerald-600" />
          <p className="text-sm text-gray-400">Yükleniyor…</p>
        </div>
      </div>
    );
  }

  const active = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* ---------- Üst bar ---------- */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/kesfet" className="flex shrink-0 items-center gap-1.5 text-emerald-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-logo text-2xl font-semibold italic tracking-wide">Artı</span>
          </Link>

          {/* Konum + arama (masaüstü) */}
          <div className="hidden flex-1 items-center gap-3 md:flex">
            <label className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
              <select
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                className="max-w-[10rem] cursor-pointer bg-transparent outline-none"
              >
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <form onSubmit={onSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="İşletme veya yemek ara…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </form>
          </div>

          {/* Sağ aksiyonlar (masaüstü) */}
          <div className="ml-auto hidden items-center gap-1 md:flex">
            <NavIcon to="/kesfet" icon={Leaf} label="Keşfet" active={active('/kesfet')} onClick={() => navigate('/kesfet')} />
            <NavIcon to="/kesfet/favoriler" icon={Heart} label="Favoriler" active={active('/kesfet/favoriler')} onClick={() => navigate('/kesfet/favoriler')} />
            <NavIcon to="/kesfet/siparislerim" icon={ShoppingBag} label="Siparişlerim" active={active('/kesfet/siparislerim')} onClick={() => navigate('/kesfet/siparislerim')} />
            {authed ? (
              <div className="ml-2 flex items-center gap-2">
                <button
                  onClick={() => navigate('/kesfet/profil')}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                  title="Profil"
                >
                  <User className="h-4 w-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-rose-50 hover:text-rose-500"
                  title="Çıkış"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/kesfet/giris')}
                className="ml-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-md active:scale-95"
              >
                Giriş Yap
              </button>
            )}
          </div>

          {/* Mobil menü butonu */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 md:hidden"
            aria-label="Menü"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobil arama şeridi */}
        <div className="border-t border-gray-100 px-4 py-2.5 md:hidden">
          <form onSubmit={onSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İşletme veya yemek ara…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </form>
        </div>

        {/* Mobil açılır menü */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-100 md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                <MobileLink to="/kesfet" icon={Leaf} label="Keşfet" onClick={() => setMenuOpen(false)} />
                <MobileLink to="/kesfet/favoriler" icon={Heart} label="Favoriler" onClick={() => setMenuOpen(false)} />
                <MobileLink to="/kesfet/siparislerim" icon={ShoppingBag} label="Siparişlerim" onClick={() => setMenuOpen(false)} />
                {authed ? (
                  <>
                    <MobileLink to="/kesfet/profil" icon={User} label="Profil" onClick={() => setMenuOpen(false)} />
                    <button onClick={handleLogout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50">
                      <LogOut className="h-[18px] w-[18px]" /> Çıkış Yap
                    </button>
                  </>
                ) : (
                  <Link to="/kesfet/giris" onClick={() => setMenuOpen(false)} className="mt-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white">
                    Giriş Yap
                  </Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ---------- İçerik ---------- */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet context={{ authed, location: loc, query }} />
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-gray-400 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Artı+ · Fazla gıdayı kurtar, tasarruf et.</p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-gray-600">Hakkımızda</Link>
            <Link to="/business" className="hover:text-gray-600">İşletme misin?</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavIcon({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 ${
        active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      <Icon className="h-[18px] w-[18px]" /> <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

function MobileLink({ to, icon: Icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100">
      <Icon className="h-[18px] w-[18px]" /> {label}
    </Link>
  );
}
