// Admin paneli ortak UI parçaları — glassmorphism dili tek yerden yönetilir.
import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Inbox } from 'lucide-react';

/* Cam kart: panelin temel yüzeyi */
export function GlassCard({ className = '', children, ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.25)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

const STATUS_STYLES = {
  PENDING_APPROVAL: { label: 'Onay Bekliyor', cls: 'bg-amber-400/15 text-amber-300 border-amber-400/30' },
  APPROVED: { label: 'Onaylı', cls: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30' },
  SUSPENDED: { label: 'Askıda', cls: 'bg-rose-400/15 text-rose-300 border-rose-400/30' },
  SENT: { label: 'Mesaj Gitti', cls: 'bg-sky-400/15 text-sky-300 border-sky-400/30' },
  REPLIED: { label: 'Cevaplandı', cls: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30' },
  PENDING_REVIEW: { label: 'İnceleme Bekliyor', cls: 'bg-amber-400/15 text-amber-300 border-amber-400/30' },
  FALLBACK_PUBLISHED: { label: 'Otomatik Yayın', cls: 'bg-violet-400/15 text-violet-300 border-violet-400/30' },
  DISMISSED: { label: 'Yoksayıldı', cls: 'bg-white/10 text-white/50 border-white/15' },
};

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { label: status, cls: 'bg-white/10 text-white/60 border-white/15' };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-white/60 ${className}`} />;
}

export function EmptyState({ icon: Icon = Inbox, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <Icon className="h-8 w-8 text-white/30" />
      </div>
      <p className="text-sm font-medium text-white/70">{title}</p>
      {hint && <p className="max-w-xs text-xs text-white/40">{hint}</p>}
    </div>
  );
}

/* Basit toast yığını — sayfa başına bir useToasts + <ToastStack/> */
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
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24 }}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium backdrop-blur-xl shadow-lg ${
              t.type === 'error'
                ? 'border-rose-400/30 bg-rose-950/80 text-rose-200'
                : 'border-emerald-400/30 bg-emerald-950/80 text-emerald-200'
            }`}
          >
            {t.type === 'error'
              ? <XCircle className="h-4 w-4 shrink-0" />
              : <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export const BUSINESS_TYPE_LABELS = {
  firin: 'Fırın', kafe: 'Kafe', restoran: 'Restoran', pastane: 'Pastane',
  market: 'Market', manav: 'Manav', kasap: 'Kasap', otel: 'Otel',
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
