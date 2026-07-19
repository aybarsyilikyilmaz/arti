// İşletme listesi: başvurular onaylanır/askıya alınır, satıra tıklanınca
// tam kapsamlı İşletme Detay sayfası açılır (profil, sipariş, kutu, finans, ekip).
// Tema: işletme paneliyle birebir aynı aydınlık dil.
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, RefreshCw, BadgeCheck, PauseCircle, ChevronRight, Plus } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { apiErrorMessage } from '../../services/api';
import {
  LightCard, StatusBadge, Spinner, EmptyState,
  SuccessButton, DangerButton, GhostButton,
  useToasts, ToastStack, typeLabel, formatDate,
} from '../../components/admin/AdminUI';

const TABS = [
  { key: 'PENDING_APPROVAL', label: 'Onay Bekleyen' },
  { key: 'PENDING_UPDATE', label: 'Değişiklik Bekleyen' },
  { key: 'APPROVED', label: 'Onaylı' },
  { key: 'SUSPENDED', label: 'Askıda' },
];

export default function BusinessApprovals() {
  const navigate = useNavigate();
  const { toasts, push } = useToasts();
  const [tab, setTab] = useState('PENDING_APPROVAL');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(''); // işlemdeki işletme id'si

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = tab === 'PENDING_UPDATE'
        ? { hasPendingUpdates: 'true', limit: 50 }
        : { status: tab, limit: 50 };
      const res = await adminService.listBusinesses(params);
      setRows(res.data.businesses);
      setTotal(res.total);
    } catch (err) {
      push(apiErrorMessage(err, 'Liste yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [tab, push]);

  useEffect(() => { load(); }, [load]);

  const act = async (e, id, kind) => {
    e.stopPropagation(); // satır tıklaması detaya gitmesin
    setActionBusy(id);
    try {
      const res = kind === 'approve'
        ? await adminService.approveBusiness(id)
        : await adminService.suspendBusiness(id);
      push(res.message);
      await load();
    } catch (err) {
      push(apiErrorMessage(err), 'error');
    } finally {
      setActionBusy('');
    }
  };

  return (
    <div>
      <ToastStack toasts={toasts} />

      {/* Başlık + sekmeler */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">İşletmeler</h1>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{total}</span> kayıt · detaya tıklayarak A'dan Z'ye yönet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SuccessButton onClick={() => navigate('/admin/panel/isletmeler/yeni')} className="px-3.5 py-1.5 text-xs h-full" title="Sıfırdan işletme ekle">
            <Plus className="h-4 w-4 mr-1" /> Yeni İşletme
          </SuccessButton>

          {/* Sekmeler — aktif pil süzülerek geçer */}
          <div className="relative flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm ml-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="relative rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300"
              >
                {tab === t.key && (
                  <motion.span
                    layoutId="approvals-tab-pill"
                    transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                    className="absolute inset-0 rounded-lg border border-emerald-200 bg-emerald-50"
                  />
                )}
                <span className={`relative z-10 ${tab === t.key ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
          <GhostButton onClick={load} className="p-2.5" title="Yenile">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </GhostButton>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <LightCard><div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div></LightCard>
      ) : rows.length === 0 ? (
        <LightCard>
          <EmptyState
            light
            icon={Building2}
            title={tab === 'PENDING_APPROVAL' ? 'Onay bekleyen işletme yok' : 'Bu durumda işletme yok'}
            hint="Yeni başvurular buraya düşer; onaylanmayan işletme kutu yayınlayamaz."
          />
        </LightCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {rows.map((b, i) => (
              <motion.div
                key={b._id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, x: -32, transition: { duration: 0.25 } }}
              >
                <LightCard
                  interactive
                  onClick={() => navigate(`/admin/panel/isletmeler/${b._id}`)}
                  className="flex cursor-pointer flex-wrap items-center gap-4 px-5 py-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {/* Avatar — logo varsa o görünür */}
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                      {b.logoUrl ? (
                        <img src={b.logoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white">
                          {b.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {b.name}{b.branchName ? ` - ${b.branchName}` : ''}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {typeLabel(b.businessType)} <span className="mx-1 text-gray-300">·</span> {b.email}
                        <span className="mx-1 text-gray-300">·</span> başvuru {formatDate(b.createdAt)}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={b.status} pulse={b.status === 'PENDING_APPROVAL'} light />

                  <div className="flex items-center gap-2">
                    {b.status !== 'APPROVED' && (
                      <SuccessButton onClick={(e) => act(e, b._id, 'approve')} disabled={actionBusy === b._id} className="px-3 py-1.5">
                        <BadgeCheck className="h-3.5 w-3.5" /> Onayla
                      </SuccessButton>
                    )}
                    {b.status !== 'SUSPENDED' && (
                      <DangerButton onClick={(e) => act(e, b._id, 'suspend')} disabled={actionBusy === b._id} className="px-3 py-1.5">
                        <PauseCircle className="h-3.5 w-3.5" /> Askıya Al
                      </DangerButton>
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </LightCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
