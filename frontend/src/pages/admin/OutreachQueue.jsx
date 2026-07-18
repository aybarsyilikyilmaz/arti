// WhatsApp otomasyon kuyruğu: botun anlayamadığı cevaplar (PENDING_REVIEW)
// burada insan tarafından çözümlenir — mesaj okunur, kutu adedi elle işlenir
// ya da kayıt yoksayılır. Diğer durumlar (SENT/REPLIED/...) filtreden izlenir.
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, RefreshCw, PackageCheck, XCircle, AlertTriangle } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { apiErrorMessage } from '../../services/api';
import {
  GlassCard, StatusBadge, Spinner, EmptyState,
  useToasts, ToastStack, formatDateTime,
} from '../../components/admin/AdminUI';

const FILTERS = [
  { key: 'PENDING_REVIEW', label: 'İnceleme Bekleyen' },
  { key: 'REPLIED', label: 'Cevaplanan' },
  { key: 'SENT', label: 'Mesaj Giden' },
  { key: 'FALLBACK_PUBLISHED', label: 'Otomatik Yayın' },
  { key: 'DISMISSED', label: 'Yoksayılan' },
];

export default function OutreachQueue() {
  const { toasts, push } = useToasts();
  const [filter, setFilter] = useState('PENDING_REVIEW');
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({});   // logId → girilen kutu adedi
  const [busyId, setBusyId] = useState('');
  const [rowErrors, setRowErrors] = useState({}); // logId → hata (örn. fiyat tanımsız)

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listOutreach({ status: filter, limit: 50 });
      setLogs(res.data.logs);
      setTotal(res.total);
      setRowErrors({});
    } catch (err) {
      push(apiErrorMessage(err, 'Kuyruk yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, push]);

  useEffect(() => { load(); }, [load]);

  const apply = async (log) => {
    const count = parseInt(counts[log._id], 10);
    if (!count || count < 1 || count > 200) {
      setRowErrors((e) => ({ ...e, [log._id]: 'Kutu adedi 1-200 arasında olmalı.' }));
      return;
    }
    setBusyId(log._id);
    setRowErrors((e) => ({ ...e, [log._id]: '' }));
    try {
      await adminService.applyOutreach(log._id, count);
      push(`${log.business?.name || 'İşletme'} için ${count} kutu stoka işlendi.`);
      setLogs((ls) => ls.filter((l) => l._id !== log._id));
    } catch (err) {
      // 409: işletmenin varsayılan fiyatları tanımlı değil — kayıt kuyruğunda kalır
      setRowErrors((e) => ({ ...e, [log._id]: apiErrorMessage(err) }));
    } finally {
      setBusyId('');
    }
  };

  const dismiss = async (log) => {
    setBusyId(log._id);
    try {
      await adminService.dismissOutreach(log._id);
      push('Kayıt yoksayıldı.');
      setLogs((ls) => ls.filter((l) => l._id !== log._id));
    } catch (err) {
      push(apiErrorMessage(err), 'error');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">WhatsApp Kuyruğu</h1>
          <p className="mt-0.5 text-sm text-white/40">
            {total} kayıt · botun çözemediği cevaplar burada insana düşer
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/50 transition hover:text-white"
          title="Yenile"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filtre çipleri */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === f.key
                ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300'
                : 'border-white/10 bg-white/5 text-white/45 hover:text-white/70'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <GlassCard><div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div></GlassCard>
      ) : logs.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={MessageCircle}
            title={filter === 'PENDING_REVIEW' ? 'İnceleme bekleyen mesaj yok 🎉' : 'Bu durumda kayıt yok'}
            hint="Bot her gün pickup saatinden 4 saat önce işletmelere sorar; anlayamadığı cevaplar buraya düşer."
          />
        </GlassCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                <GlassCard className="flex h-full flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{log.business?.name || 'Silinmiş işletme'}</p>
                      <p className="mt-0.5 text-xs text-white/40">
                        {log.business?.whatsappPhone || log.business?.phone || '—'} · {log.date}
                      </p>
                    </div>
                    <StatusBadge status={log.status} />
                  </div>

                  {/* WhatsApp cevap balonu */}
                  {log.replyText ? (
                    <div className="mb-4 flex">
                      <div className="relative max-w-[90%] rounded-2xl rounded-tl-sm border border-emerald-400/15 bg-emerald-900/40 px-4 py-2.5">
                        <p className="text-sm leading-relaxed text-emerald-50/90">“{log.replyText}”</p>
                        <p className="mt-1 text-right text-[10px] text-white/30">{formatDateTime(log.repliedAt)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mb-4 text-xs italic text-white/30">
                      Cevap metni yok{log.sentAt ? ` · mesaj ${formatDateTime(log.sentAt)} tarihinde gitti` : ''}
                    </p>
                  )}

                  {log.status === 'PENDING_REVIEW' && (
                    <div className="mt-auto space-y-2.5 border-t border-white/[0.07] pt-4">
                      {rowErrors[log._id] && (
                        <p className="flex items-start gap-1.5 text-xs font-medium text-amber-300">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {rowErrors[log._id]}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="200"
                          placeholder="Kutu adedi"
                          value={counts[log._id] || ''}
                          onChange={(e) => setCounts((c) => ({ ...c, [log._id]: e.target.value }))}
                          className="w-28 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none transition focus:border-emerald-400/50"
                        />
                        <button
                          onClick={() => apply(log)}
                          disabled={busyId === log._id}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
                        >
                          <PackageCheck className="h-4 w-4" /> Stoka İşle
                        </button>
                        <button
                          onClick={() => dismiss(log)}
                          disabled={busyId === log._id}
                          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/50 transition hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" /> Yoksay
                        </button>
                      </div>
                    </div>
                  )}

                  {log.status === 'REPLIED' && log.parsedCount != null && (
                    <p className="mt-auto border-t border-white/[0.07] pt-3 text-xs text-white/40">
                      Bot <span className="font-bold text-emerald-300">{log.parsedCount} kutu</span> olarak işledi.
                    </p>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
