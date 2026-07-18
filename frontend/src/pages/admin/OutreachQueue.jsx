// WhatsApp otomasyon kuyruğu: botun anlayamadığı cevaplar (PENDING_REVIEW)
// modern chat kartlarında insan tarafından çözümlenir — mesaj okunur, kutu
// adedi elle işlenir ya da kayıt yoksayılır.
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, RefreshCw, PackageCheck, XCircle, AlertTriangle, Bot } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { apiErrorMessage } from '../../services/api';
import {
  GlassCard, StatusBadge, Spinner, EmptyState,
  PrimaryButton, GhostButton,
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
      // 409: işletmenin varsayılan fiyatları tanımlı değil — kayıt kuyrukta kalır
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
          <h1 className="text-2xl font-bold tracking-tight text-white">WhatsApp Kuyruğu</h1>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-semibold text-slate-300">{total}</span> kayıt · botun çözemediği cevaplar burada insana düşer
          </p>
        </div>
        <GhostButton onClick={load} className="p-2.5" title="Yenile">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </GhostButton>
      </div>

      {/* Filtre çipleri — aktif pil süzülerek geçer */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95"
          >
            {filter === f.key && (
              <motion.span
                layoutId="outreach-filter-pill"
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                className="absolute inset-0 rounded-full bg-indigo-500/[0.16] ring-1 ring-inset ring-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
              />
            )}
            <span className={`relative z-10 ${filter === f.key ? 'text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>
              {f.label}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <GlassCard><div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div></GlassCard>
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
            {logs.map((log, i) => (
              <motion.div
                key={log._id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.22 } }}
              >
                <GlassCard interactive className="flex h-full flex-col p-5">
                  {/* Üst satır: işletme + durum */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 rounded-xl bg-emerald-500/25 blur-md" />
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/25 to-slate-800/60 text-sm font-bold text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                          {(log.business?.name || '?').charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{log.business?.name || 'Silinmiş işletme'}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {log.business?.whatsappPhone || log.business?.phone || '—'}
                          <span className="mx-1 text-slate-700">·</span>{log.date}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={log.status} pulse={log.status === 'PENDING_REVIEW'} />
                  </div>

                  {/* Sohbet: bot sorusu + işletme cevabı */}
                  <div className="mb-4 space-y-2.5">
                    <div className="flex justify-end">
                      <div className="flex max-w-[85%] items-start gap-2">
                        <div className="rounded-2xl rounded-tr-sm border border-indigo-400/15 bg-indigo-500/[0.12] px-3.5 py-2">
                          <p className="text-xs leading-relaxed text-indigo-100/80">Bugün fazladan paketiniz var mı? Sayıyı yazmanız yeterli 🙌</p>
                          {log.sentAt && <p className="mt-1 text-right text-[10px] text-slate-600">{formatDateTime(log.sentAt)}</p>}
                        </div>
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500/15">
                          <Bot className="h-3 w-3 text-indigo-300" />
                        </div>
                      </div>
                    </div>

                    {log.replyText ? (
                      <div className="flex">
                        <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-emerald-400/15 bg-emerald-500/[0.09] px-3.5 py-2 shadow-[0_4px_16px_rgba(16,185,129,0.06)]">
                          <p className="text-sm leading-relaxed text-emerald-50/90">“{log.replyText}”</p>
                          <p className="mt-1 text-[10px] text-slate-600">{formatDateTime(log.repliedAt)}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-600">Henüz cevap yok…</p>
                    )}
                  </div>

                  {/* Çözümleme aksiyonları */}
                  {log.status === 'PENDING_REVIEW' && (
                    <div className="mt-auto space-y-2.5 border-t border-white/[0.06] pt-4">
                      <AnimatePresence>
                        {rowErrors[log._id] && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-start gap-1.5 overflow-hidden text-xs font-medium text-amber-400"
                          >
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {rowErrors[log._id]}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="200"
                          placeholder="Adet"
                          value={counts[log._id] || ''}
                          onChange={(e) => setCounts((c) => ({ ...c, [log._id]: e.target.value }))}
                          className="admin-no-spinner w-24 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-center text-sm font-semibold text-white placeholder-slate-600 outline-none transition-all duration-300 ease-in-out focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <PrimaryButton
                          onClick={() => apply(log)}
                          disabled={busyId === log._id}
                          className="flex-1 px-3 py-2"
                        >
                          <PackageCheck className="h-4 w-4" /> Stoka İşle
                        </PrimaryButton>
                        <GhostButton
                          onClick={() => dismiss(log)}
                          disabled={busyId === log._id}
                          className="px-3 py-2 hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <XCircle className="h-4 w-4" /> Yoksay
                        </GhostButton>
                      </div>
                    </div>
                  )}

                  {log.status === 'REPLIED' && log.parsedCount != null && (
                    <p className="mt-auto border-t border-white/[0.06] pt-3 text-xs text-slate-500">
                      Bot <span className="font-bold text-emerald-400">{log.parsedCount} kutu</span> olarak otomatik işledi.
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
