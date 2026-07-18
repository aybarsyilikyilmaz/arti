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
          <h1 className="text-xl font-bold tracking-tight">İşletme Onayları</h1>
          <p className="mt-0.5 text-sm text-white/40">{total} kayıt · vergi bilgisi yalnızca detayda görünür</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  tab === t.key ? 'bg-emerald-400/15 text-emerald-300' : 'text-white/45 hover:text-white/70'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/50 transition hover:text-white"
            title="Yenile"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Liste */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={tab === 'PENDING_APPROVAL' ? 'Onay bekleyen işletme yok' : 'Bu durumda işletme yok'}
            hint="Yeni başvurular buraya düşer; onaylanmayan işletme kutu yayınlayamaz."
          />
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            <AnimatePresence initial={false}>
              {rows.map((b) => (
                <motion.li
                  key={b._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -24 }}
                  className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-white/[0.03]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-emerald-400/20 to-brand/20 text-sm font-bold text-emerald-300">
                      {b.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{b.name}</p>
                      <p className="truncate text-xs text-white/40">
                        {typeLabel(b.businessType)} · {b.email} · başvuru {formatDate(b.createdAt)}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={b.status} />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDetail(b._id)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10"
                    >
                      <Eye className="h-3.5 w-3.5" /> İncele
                    </button>
                    {b.status !== 'APPROVED' && (
                      <button
                        onClick={() => act(b._id, 'approve')}
                        disabled={actionBusy === b._id}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
                      >
                        <BadgeCheck className="h-3.5 w-3.5" /> Onayla
                      </button>
                    )}
                    {b.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => act(b._id, 'suspend')}
                        disabled={actionBusy === b._id}
                        className="flex items-center gap-1.5 rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-400/20 disabled:opacity-50"
                      >
                        <PauseCircle className="h-3.5 w-3.5" /> Askıya Al
                      </button>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </GlassCard>

      {/* Detay yan paneli */}
      <AnimatePresence>
        {(detail || detailBusy) && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDetail(null)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#0d241b]/95 p-6 backdrop-blur-2xl"
            >
              {detailBusy || !detail ? (
                <div className="flex h-full items-center justify-center"><Spinner className="h-7 w-7" /></div>
              ) : (
                <>
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold">{detail.name}</h2>
                      <div className="mt-1.5 flex items-center gap-2">
                        <StatusBadge status={detail.status} />
                        <span className="text-xs text-white/40">{typeLabel(detail.businessType)}</span>
                      </div>
                    </div>
                    <button onClick={() => setDetail(null)} className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-white">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <DetailRow icon={FileDigit} label="Vergi No (KVKK — şifreli saklanır)" value={detail.taxNumber || '—'} mono />
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
                      <button
                        onClick={() => act(detail._id, 'approve')}
                        disabled={actionBusy === detail._id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
                      >
                        <BadgeCheck className="h-4 w-4" /> İşletmeyi Onayla
                      </button>
                    )}
                    {detail.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => act(detail._id, 'suspend')}
                        disabled={actionBusy === detail._id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 py-3 text-sm font-semibold text-rose-300 transition hover:bg-rose-400/20 disabled:opacity-50"
                      >
                        <PauseCircle className="h-4 w-4" /> Askıya Al
                      </button>
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

function DetailRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300/70" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35">{label}</p>
        <p className={`mt-0.5 break-words text-sm text-white/85 ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
