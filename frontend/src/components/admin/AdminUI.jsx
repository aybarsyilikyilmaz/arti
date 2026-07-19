// Admin paneli tasarım sistemi — "premium" tema (Linear/Vercel dili):
// gece mavisi mesh gradient + ince ızgara zemin, cam yüzeyler, indigo/zümrüt
// vurgular, tüm etkileşimlerde 300ms ease pürüzsüz mikro-animasyonlar.
import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Inbox } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Zemin: gece mavisi + süzülen mesh gradient lekeleri + çizgi ızgara  */
/* Her admin sayfası kabuğunun en altına bir kez konur.                */
/* ------------------------------------------------------------------ */
export function AdminBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden bg-[#070b14]">
      {/* Mesh lekeleri — çok yavaş süzülür */}
      <div className="animate-admin-drift absolute -left-40 -top-48 h-[36rem] w-[36rem] rounded-full bg-indigo-600/25 blur-[140px]" />
      <div className="animate-admin-drift-2 absolute -right-48 top-1/4 h-[30rem] w-[30rem] rounded-full bg-emerald-500/[0.13] blur-[130px]" />
      <div className="animate-admin-drift-3 absolute -bottom-56 left-1/3 h-[34rem] w-[34rem] rounded-full bg-sky-600/15 blur-[150px]" />
      {/* Linear tarzı ince ızgara + tepe parlaması */}
      <div className="admin-grid absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cam kart — interactive verilirse hover'da yükselir ve parlar        */
/* ------------------------------------------------------------------ */
export function GlassCard({ className = '', interactive = false, children, ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl
        shadow-[0_8px_40px_rgba(2,6,23,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]
        transition-all duration-300 ease-in-out
        ${interactive ? 'hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_20px_60px_rgba(79,70,229,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]' : ''}
        ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buton seti — tıklamada scale-95, hover'da yumuşak parlama           */
/* ------------------------------------------------------------------ */
const BTN_BASE = `inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold
  transition-all duration-300 ease-in-out active:scale-95 active:duration-100
  disabled:pointer-events-none disabled:opacity-40 select-none`;

export function PrimaryButton({ className = '', ...rest }) {
  // Parlak indigo — ana aksiyon
  return (
    <button
      className={`${BTN_BASE} bg-indigo-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.35)]
        hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-[0_8px_28px_rgba(99,102,241,0.5)] ${className}`}
      {...rest}
    />
  );
}

export function SuccessButton({ className = '', ...rest }) {
  // Zümrüt — onay aksiyonları
  return (
    <button
      className={`${BTN_BASE} bg-emerald-500 text-emerald-950 shadow-[0_4px_20px_rgba(16,185,129,0.3)]
        hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_8px_28px_rgba(16,185,129,0.45)] ${className}`}
      {...rest}
    />
  );
}

export function GhostButton({ className = '', ...rest }) {
  return (
    <button
      className={`${BTN_BASE} border border-white/10 bg-white/[0.04] text-slate-300
        hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.09] hover:text-white ${className}`}
      {...rest}
    />
  );
}

export function DangerButton({ className = '', ...rest }) {
  return (
    <button
      className={`${BTN_BASE} border border-rose-500/25 bg-rose-500/10 text-rose-300
        hover:-translate-y-0.5 hover:border-rose-400/40 hover:bg-rose-500/20 hover:shadow-[0_8px_24px_rgba(244,63,94,0.2)] ${className}`}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Durum rozetleri — saydam renkli zemin + parlak metin + nokta        */
/* ------------------------------------------------------------------ */
const STATUS_STYLES = {
  PENDING_APPROVAL:   { label: 'Onay Bekliyor',      cls: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',     dot: 'bg-amber-400' },
  APPROVED:           { label: 'Onaylı',             cls: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20', dot: 'bg-emerald-400' },
  SUSPENDED:          { label: 'Askıda',             cls: 'bg-rose-500/10 text-rose-400 ring-rose-500/20',        dot: 'bg-rose-400' },
  SENT:               { label: 'Mesaj Gitti',        cls: 'bg-sky-500/10 text-sky-400 ring-sky-500/20',           dot: 'bg-sky-400' },
  REPLIED:            { label: 'Cevaplandı',         cls: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20', dot: 'bg-emerald-400' },
  PENDING_REVIEW:     { label: 'İnceleme Bekliyor',  cls: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',     dot: 'bg-amber-400' },
  FALLBACK_PUBLISHED: { label: 'Otomatik Yayın',     cls: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',  dot: 'bg-violet-400' },
  DISMISSED:          { label: 'Yoksayıldı',         cls: 'bg-slate-500/10 text-slate-400 ring-slate-500/20',     dot: 'bg-slate-500' },
  // Sipariş durumları (kullanıcı uygulaması)
  RESERVED:           { label: 'Ödeme Bekliyor',     cls: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',     dot: 'bg-amber-400' },
  PAID:               { label: 'Teslime Hazır',      cls: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20', dot: 'bg-emerald-400' },
  PICKED_UP:          { label: 'Teslim Edildi',      cls: 'bg-sky-500/10 text-sky-400 ring-sky-500/20',           dot: 'bg-sky-400' },
  EXPIRED:            { label: 'Süresi Doldu',       cls: 'bg-slate-500/10 text-slate-400 ring-slate-500/20',     dot: 'bg-slate-500' },
  REFUNDED:           { label: 'İade Edildi',        cls: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',  dot: 'bg-violet-400' },
};

export function StatusBadge({ status, pulse = false }) {
  const s = STATUS_STYLES[status] || { label: status, cls: 'bg-slate-500/10 text-slate-400 ring-slate-500/20', dot: 'bg-slate-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${s.cls}`}>
      <span className="relative flex h-1.5 w-1.5">
        {pulse && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${s.dot}`} />}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
      </span>
      {s.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Küçük yardımcılar                                                   */
/* ------------------------------------------------------------------ */
export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-slate-500 ${className}`} />;
}

export function EmptyState({ icon: Icon = Inbox, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl" />
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md">
          <Icon className="h-8 w-8 text-slate-500" />
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      {hint && <p className="max-w-sm text-xs leading-relaxed text-slate-500">{hint}</p>}
    </div>
  );
}

/* Toast yığını — sağ altta cam bildirimler */
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return { toasts, push };
}

export function ToastStack({ toasts }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 32, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-2xl
              shadow-[0_12px_40px_rgba(2,6,23,0.6)] ${
              t.type === 'error'
                ? 'border-rose-500/25 bg-rose-950/70 text-rose-200'
                : 'border-emerald-500/25 bg-emerald-950/70 text-emerald-200'
            }`}
          >
            {t.type === 'error'
              ? <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
              : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export const BUSINESS_TYPE_LABELS = {
  firin: 'Fırın', kafe: 'Kafe', restoran: 'Restoran', pastane: 'Pastane',
  market: 'Market', manav: 'Manav', kasap: 'Kasap', otel: 'Otel', diger: 'Diğer',
};

export function typeLabel(t) {
  return BUSINESS_TYPE_LABELS[t] || (t ? t.charAt(0).toUpperCase() + t.slice(1) : '—');
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
