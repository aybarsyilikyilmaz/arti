// İşletme Detay — admin, hesap değiştirmeden (impersonation'sız) bir işletmenin
// her şeyini tek sayfadan yönetir. 5 sekme: Profil & Ayarlar, Siparişler,
// Kutu & Vitrin, Finans & Hakediş, Ekip & Şubeler.
// Aktif sekme URL'de tutulur (?tab=…) — sayfa yenilense de kaybolmaz.
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BadgeCheck, PauseCircle, UserCog, ShoppingBag,
  Package, Banknote, Users,
} from 'lucide-react';
import * as adminService from '../../services/adminService';
import { apiErrorMessage } from '../../services/api';
import {
  LightCard, StatusBadge, Spinner, SuccessButton, DangerButton, GhostButton,
  useToasts, ToastStack, typeLabel, formatDate,
} from '../../components/admin/AdminUI';
import ProfileTab from './detail/ProfileTab';
import OrdersTab from './detail/OrdersTab';
import BoxesTab from './detail/BoxesTab';
import FinanceTab from './detail/FinanceTab';
import TeamTab from './detail/TeamTab';

const TABS = [
  { key: 'profil', label: 'Profil & Ayarlar', icon: UserCog },
  { key: 'siparisler', label: 'Siparişler', icon: ShoppingBag, badge: (s) => s.orderCount },
  { key: 'kutu', label: 'Kutu & Vitrin', icon: Package, dot: (s) => s.todayPublished },
  { key: 'finans', label: 'Finans & Hakediş', icon: Banknote },
  { key: 'ekip', label: 'Ekip & Şubeler', icon: Users, badge: (s) => s.employeeCount + s.branchCount },
];

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'profil';
  const { toasts, push } = useToasts();

  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState({ orderCount: 0, employeeCount: 0, branchCount: 0, todayPublished: false });
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await adminService.getBusinessDetailFull(id);
      setBusiness(d.business);
      setStats(d.stats);
    } catch (err) {
      push(apiErrorMessage(err, 'İşletme yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [id, push]);

  useEffect(() => { load(); }, [load]);

  const setTab = (key) => setSearchParams(key === 'profil' ? {} : { tab: key }, { replace: true });

  const act = async (kind) => {
    setActionBusy(true);
    try {
      const res = kind === 'approve'
        ? await adminService.approveBusiness(id)
        : await adminService.suspendBusiness(id);
      push(res.message);
      await load();
    } catch (err) {
      push(apiErrorMessage(err), 'error');
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) {
    return <LightCard><div className="flex justify-center py-24"><Spinner className="h-8 w-8" /></div></LightCard>;
  }
  if (!business) {
    return (
      <LightCard className="p-10 text-center">
        <p className="text-sm font-semibold text-gray-700">İşletme bulunamadı.</p>
        <GhostButton onClick={() => navigate('/admin/panel/isletmeler')} className="mx-auto mt-4 px-4 py-2">
          <ArrowLeft className="h-4 w-4" /> Listeye Dön
        </GhostButton>
      </LightCard>
    );
  }

  return (
    <div>
      <ToastStack toasts={toasts} />

      {/* Üst başlık kartı */}
      <LightCard className="mb-5 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <GhostButton onClick={() => navigate('/admin/panel/isletmeler')} className="p-2.5" title="Listeye dön">
            <ArrowLeft className="h-4 w-4" />
          </GhostButton>

          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
            {business.logoUrl ? (
              <img src={business.logoUrl} alt="logo" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white">
                {business.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="truncate text-xl font-bold tracking-tight text-gray-900">
                {business.name}{business.branchName ? ` - ${business.branchName}` : ''}
              </h1>
              <StatusBadge status={business.status} pulse={business.status === 'PENDING_APPROVAL'} light />
            </div>
            <p className="mt-0.5 text-sm text-gray-400">
              {typeLabel(business.businessType)}
              <span className="mx-1.5 text-gray-300">·</span>{business.email}
              <span className="mx-1.5 text-gray-300">·</span>başvuru {formatDate(business.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {business.status !== 'APPROVED' && (
              <SuccessButton onClick={() => act('approve')} disabled={actionBusy} className="px-4 py-2.5">
                <BadgeCheck className="h-4 w-4" /> Onayla
              </SuccessButton>
            )}
            {business.status !== 'SUSPENDED' && (
              <DangerButton onClick={() => act('suspend')} disabled={actionBusy} className="px-4 py-2.5">
                <PauseCircle className="h-4 w-4" /> Askıya Al
              </DangerButton>
            )}
          </div>
        </div>

        {/* Sekme çubuğu */}
        <div className="mt-5 flex flex-wrap gap-1 border-t border-gray-100 pt-4">
          {TABS.map((t) => {
            const active = tab === t.key;
            const badge = t.badge ? t.badge(stats) : null;
            const dot = t.dot ? t.dot(stats) : false;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-300"
              >
                {active && (
                  <motion.span
                    layoutId="business-detail-tab"
                    transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                    className="absolute inset-0 rounded-xl border border-emerald-200 bg-emerald-50"
                  />
                )}
                <t.icon className={`relative z-10 h-4 w-4 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className={`relative z-10 ${active ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}>
                  {t.label}
                </span>
                {badge != null && badge > 0 && (
                  <span className={`relative z-10 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {badge}
                  </span>
                )}
                {dot && (
                  <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-emerald-500" title="Bugün kutu yayında" />
                )}
              </button>
            );
          })}
        </div>
      </LightCard>

      {/* Sekme içeriği */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {tab === 'profil' && <ProfileTab business={business} reload={load} push={push} />}
        {tab === 'siparisler' && <OrdersTab businessId={id} push={push} />}
        {tab === 'kutu' && <BoxesTab business={business} reload={load} push={push} />}
        {tab === 'finans' && <FinanceTab businessId={id} push={push} />}
        {tab === 'ekip' && <TeamTab businessId={id} push={push} />}
      </motion.div>
    </div>
  );
}
