// İşletme paneli kabuğu: guard + sidebar + onay durumu banner'ı.
// Panelin TAMAMI aydınlık temadadır (kullanıcı talebi) — koyu tema yalnızca
// admin panelinde kalır. Sidebar'da işletmenin yüklediği logo görünür.
import React, { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Settings, LogOut, Store, Hourglass, ImageIcon, Bell, User, ShoppingBag, Banknote, LifeBuoy } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as businessService from '../../services/businessService';
import { Spinner, StatusBadge } from '../../components/admin/AdminUI';

import BranchSwitcher from '../../components/business/BranchSwitcher';

const NAV = [
  { to: 'genel-bakis', label: 'Genel Bakış', icon: LayoutDashboard },
  { to: 'siparisler', label: 'Siparişlerim', icon: ShoppingBag },
  { to: 'kutu', label: 'Kutu & Teslimat', icon: Package },
  { to: 'finans', label: 'Finans & Ödemeler', icon: Banknote },
  { to: 'vitrin', label: 'Vitrin Yönetimi', icon: ImageIcon },
  { to: 'profil', label: 'Profilim', icon: User },
  { to: 'ayarlar', label: 'Ayarlar', icon: Settings },
  { to: 'ekip', label: 'Ekip Yönetimi', icon: User, adminOnly: true },
  { to: 'destek', label: 'Destek', icon: LifeBuoy },
];

export default function BusinessLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authed, restoring, logout } = useAuth('business');
  const [me, setMe] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const reloadMe = useCallback(async () => {
    try {
      const [profileData, notifData] = await Promise.all([
        businessService.getMe(),
        businessService.getNotifications().catch(() => ({ unreadCount: 0, notifications: [] })),
      ]);
      setMe(profileData.business);
      setEmployeeData(profileData.employee || null);
      if (notifData) {
        setNotifications(notifData.notifications || []);
        setUnreadCount(notifData.unreadCount || 0);
      }
    } catch {}
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await businessService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await businessService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  useEffect(() => { if (authed) reloadMe(); }, [authed, reloadMe]);

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

  // Giriş yapılmamışsa /business sihirbazının giriş moduna gönderilir
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
          {/* Marka — logo yüklendiyse o görünür */}
          <div className="mb-8 flex items-center gap-3 px-1 lg:px-2">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
              {me?.logoUrl ? (
                <img src={me.logoUrl} alt="logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700">
                  <Store className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-bold leading-tight tracking-tight text-gray-900">
                {me?.name || 'İşletme Paneli'}{me?.branchName ? ` - ${me.branchName}` : ''}
              </p>
              <p className="text-[11px] font-medium text-gray-400">Artı+ İşletme</p>
            </div>
          </div>

          {/* Menü — aktif pil sekmeler arasında süzülür */}
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.filter(item => {
              if (item.adminOnly && employeeData) return false;
              if (employeeData) {
                return employeeData.allowedPages?.includes(item.to);
              }
              return true;
            }).map(({ to, label, icon: Icon }) => {
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

        <main className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-end gap-3">
            {!employeeData && <BranchSwitcher me={me} />}
            <button
              className="relative rounded-xl border border-gray-200 bg-white p-2.5 text-gray-400 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:text-gray-600 hover:shadow-md active:scale-95"
              title="Bildirimler"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-emerald-200"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </button>

            {/* Profil */}
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                {me?.logoUrl ? (
                  <img src={me.logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs font-semibold text-gray-700">{me?.name || 'İşletme'}</p>
              </div>
            </div>
          </div>

          {/* Onay bekliyor / askıda uyarısı */}
          {me && me.status !== 'APPROVED' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"
            >
              <Hourglass className="h-5 w-5 shrink-0 text-amber-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-700">
                  {me.status === 'PENDING_APPROVAL' ? 'Başvurun inceleniyor' : 'Hesabın askıya alındı'}
                </p>
                <p className="mt-0.5 text-xs text-amber-600/80">
                  {me.status === 'PENDING_APPROVAL'
                    ? 'Ekibimiz vergi bilgilerini doğruladıktan sonra kutu yayınlayabileceksin. Ayarlarını şimdiden yapabilirsin.'
                    : 'Kutu yayınlama kapalı. Destek için bizimle iletişime geç.'}
                </p>
              </div>
              <StatusBadge status={me.status} pulse={me.status === 'PENDING_APPROVAL'} light />
            </motion.div>
          )}

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {(() => {
              const currentPath = location.pathname.split('/').pop();
              const currentNavItem = NAV.find(item => item.to === currentPath);
              
              if (employeeData && currentNavItem) {
                if (currentNavItem.adminOnly || !employeeData.allowedPages?.includes(currentPath)) {
                  const defaultPage = employeeData.allowedPages?.length > 0 ? employeeData.allowedPages[0] : null;
                  if (defaultPage && currentPath !== defaultPage) {
                    return <Navigate to={`/panel/${defaultPage}`} replace />;
                  } else if (!defaultPage) {
                    return (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Shield className="mb-4 h-12 w-12 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900">Yetkiniz Yok</h3>
                        <p className="mt-2 text-sm text-gray-500">Bu panele erişim yetkiniz bulunmamaktadır. Lütfen yöneticinizle iletişime geçin.</p>
                      </div>
                    );
                  }
                }
              }
              return <Outlet context={{ me, reloadMe, employeeData }} />;
            })()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
