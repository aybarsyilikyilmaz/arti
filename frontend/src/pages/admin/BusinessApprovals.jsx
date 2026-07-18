// İşletme onay ekranı: başvuran işletmeler listelenir, detayı (çözülmüş VKN dahil)
// yan panelde incelenir, onaylanır ya da askıya alınır.
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, RefreshCw, Eye, BadgeCheck, PauseCircle,
  Phone, Mail, MapPin, FileDigit, X, Clock, Package,
} from 'lucide-react';
import * as adminService from '../../services/adminService';
import { apiErrorMessage } from '../../services/api';
import {
  GlassCard, StatusBadge, Spinner, EmptyState,
  SuccessButton, GhostButton, DangerButton,
  useToasts, ToastStack, typeLabel, formatDate,
} from '../../components/admin/AdminUI';

const TABS = [
  { key: 'PENDING_APPROVAL', label: 'Onay Bekleyen' },
  { key: 'APPROVED', label: 'Onaylı' },
  { key: 'SUSPENDED', label: 'Askıda' },
];

export default function BusinessApprovals() {
  const { toasts, push } = useToasts();
  const [tab, setTab] = useState('PENDING_APPROVAL');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);      // yan panelde açık işletme
  const [detailBusy, setDetailBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState(''); // işlemdeki işletme id'si

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listBusinesses({ status: tab, limit: 50 });
      setRows(res.data.businesses);
      setTotal(res.total);
    } catch (err) {
      push(apiErrorMessage(err, 'Liste yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [tab, push]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id) => {
    setDetailBusy(true);
    try {
      setDetail(await adminService.getBusinessDetail(id)); // VKN yalnızca burada çözülür
    } catch (err) {
      push(apiErrorMessage(err, 'Detay alınamadı.'), 'error');
    } finally {
      setDetailBusy(false);
    }
  };

  const act = async (id, kind) => {
    setActionBusy(id);
    try {
      const res = kind === 'approve'
        ? await adminService.approveBusiness(id)
        : await adminService.suspendBusiness(id);
      push(res.message);
      setDetail(null);
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
          <h1 className="text-2xl font-bold tracking-tight text-white">İşletme Onayları</h1>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-semibold text-slate-300">{total}</span> kayıt · vergi bilgisi yalnızca detayda görünür
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sekmeler — aktif pil süzülerek geçer */}
          <div className="relative flex rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
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
                    className="absolute inset-0 rounded-lg bg-indigo-500/[0.16] ring-1 ring-inset ring-indigo-400/25"
                  />
                )}
                <span className={`relative z-10 ${tab === t.key ? 'text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>
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
        <GlassCard><div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div></GlassCard>
      ) : rows.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={Building2}
            title={tab === 'PENDING_APPROVAL' ? 'Onay bekleyen işletme yok' : 'Bu durumda işletme yok'}
            hint="Yeni başvurular buraya düşer; onaylanmayan işletme kutu yayınlayamaz."
          />
        </GlassCard>
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
                <GlassCard interactive className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 rounded-xl bg-indigo-500/25 blur-md" />
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/30 to-slate-800/60 text-sm font-bold text-indigo-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                        {b.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{b.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {typeLabel(b.businessType)} <span className="mx-1 text-slate-700">·</span> {b.email}
                        <span className="mx-1 text-slate-700">·</span> başvuru {formatDate(b.createdAt)}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={b.status} pulse={b.status === 'PENDING_APPROVAL'} />

                  <div className="flex items-center gap-2">
                    <GhostButton onClick={() => openDetail(b._id)} className="px-3 py-1.5">
                      <Eye className="h-3.5 w-3.5" /> İncele
                    </GhostButton>
                    {b.status !== 'APPROVED' && (
                      <SuccessButton onClick={() => act(b._id, 'approve')} disabled={actionBusy === b._id} className="px-3 py-1.5">
                        <BadgeCheck className="h-3.5 w-3.5" /> Onayla
                      </SuccessButton>
                    )}
                    {b.status !== 'SUSPENDED' && (
                      <DangerButton onClick={() => act(b._id, 'suspend')} disabled={actionBusy === b._id} className="px-3 py-1.5">
                        <PauseCircle className="h-3.5 w-3.5" /> Askıya Al
                      </DangerButton>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detay yan paneli */}
      <AnimatePresence>
        {(detail || detailBusy) && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDetail(null)}
              className="fixed inset-0 z-40 bg-[#070b14]/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0a101f]/90 p-6 backdrop-blur-2xl shadow-[-24px_0_80px_rgba(2,6,23,0.8)]"
            >
              {detailBusy || !detail ? (
                <div className="flex h-full items-center justify-center"><Spinner className="h-7 w-7" /></div>
              ) : (
                <>
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-white">{detail.name}</h2>
                      <div className="mt-2 flex items-center gap-2">
                        <StatusBadge status={detail.status} />
                        <span className="text-xs text-slate-500">{typeLabel(detail.businessType)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDetail(null)}
                      className="rounded-lg p-2 text-slate-500 transition-all duration-300 hover:bg-white/[0.07] hover:text-white active:scale-95"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <DetailRow icon={FileDigit} label="Vergi No (KVKK — şifreli saklanır)" value={detail.taxNumber || '—'} mono highlight />
                    <DetailRow icon={Mail} label="E-posta" value={detail.email} />
                    <DetailRow icon={Phone} label="Telefon" value={detail.phone || detail.contactPhone || '—'} />
                    <DetailRow icon={Phone} label="WhatsApp" value={detail.whatsappPhone || '—'} />
                    <DetailRow icon={MapPin} label="Adres" value={detail.address || '—'} />
                    <DetailRow icon={Clock} label="Teslim Aralığı" value={detail.pickupStart ? `${detail.pickupStart} – ${detail.pickupEnd || '?'}` : 'Tanımsız'} />
                    <DetailRow
                      icon={Package}
                      label="Varsayılan Kutu"
                      value={detail.defaultPackageCount
                        ? `${detail.defaultPackageCount} adet · ${detail.defaultPrice || '?'} TL (${detail.defaultOriginalPrice || '?'} TL değerinde)`
                        : 'Tanımsız — WhatsApp otomasyonu admin onayına düşer'}
                    />
                    <DetailRow icon={BadgeCheck} label="KVKK Açık Rıza" value={detail.kvkkConsentAt ? formatDate(detail.kvkkConsentAt) : 'YOK'} />
                  </div>

                  <div className="mt-8 flex gap-3">
                    {detail.status !== 'APPROVED' && (
                      <SuccessButton
                        onClick={() => act(detail._id, 'approve')}
                        disabled={actionBusy === detail._id}
                        className="flex-1 py-3 text-sm"
                      >
                        <BadgeCheck className="h-4 w-4" /> İşletmeyi Onayla
                      </SuccessButton>
                    )}
                    {detail.status !== 'SUSPENDED' && (
                      <DangerButton
                        onClick={() => act(detail._id, 'suspend')}
                        disabled={actionBusy === detail._id}
                        className="flex-1 py-3 text-sm"
                      >
                        <PauseCircle className="h-4 w-4" /> Askıya Al
                      </DangerButton>
                    )}
                  </div>
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, mono = false, highlight = false }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ease-in-out hover:border-white/20 hover:bg-white/[0.06] ${
      highlight ? 'border-indigo-400/20 bg-indigo-500/[0.07]' : 'border-white/[0.07] bg-white/[0.03]'
    }`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? 'text-indigo-300' : 'text-slate-500'}`} />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
        <p className={`mt-0.5 break-words text-sm text-slate-200 ${mono ? 'font-mono tracking-[0.15em]' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
