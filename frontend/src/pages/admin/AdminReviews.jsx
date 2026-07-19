// Yorum Moderasyonu — müşterilerin işletmelere bıraktığı puan/yorumlar.
// Düşük puan filtresiyle sorunlu yorumlar hızla bulunur, gerekirse silinir.
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, RefreshCw, Trash2, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { apiErrorMessage } from '../../services/api';
import {
  LightCard, Spinner, EmptyState, GhostButton, DangerButton,
  useToasts, ToastStack, formatDateTime,
} from '../../components/admin/AdminUI';

const FILTERS = [
  { key: '', label: 'Tümü' },
  { key: '3', label: '≤ 3 Yıldız' },
  { key: '2', label: '≤ 2 Yıldız' },
  { key: '1', label: '1 Yıldız' },
];

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
      ))}
    </span>
  );
}

export default function AdminReviews() {
  const { toasts, push } = useToasts();
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filter) params.maxRating = filter;
      setData(await adminService.listReviews(params));
    } catch (err) {
      push(apiErrorMessage(err, 'Yorumlar yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, page, push]);

  useEffect(() => { load(); }, [load]);

  const remove = async (review) => {
    if (!window.confirm('Bu yorum kalıcı olarak silinsin mi? İşletmenin puan ortalaması yeniden hesaplanır.')) return;
    setBusyId(review._id);
    try {
      const res = await adminService.deleteReview(review._id);
      push(res.message);
      setData((d) => ({ ...d, reviews: d.reviews.filter((r) => r._id !== review._id), totalReviews: d.totalReviews - 1 }));
    } catch (err) {
      push(apiErrorMessage(err), 'error');
    } finally {
      setBusyId('');
    }
  };

  const reviews = data?.reviews || [];

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Yorum Moderasyonu</h1>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{data?.totalReviews ?? 0}</span> yorum · düşük puanları filtreleyip incele
          </p>
        </div>
        <GhostButton onClick={load} className="p-2.5" title="Yenile">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </GhostButton>
      </div>

      {/* Puan filtresi */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className="relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95"
          >
            {filter === f.key && (
              <motion.span
                layoutId="reviews-filter-pill"
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                className="absolute inset-0 rounded-full border border-emerald-200 bg-emerald-50"
              />
            )}
            <span className={`relative z-10 ${filter === f.key ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'}`}>
              {f.label}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <LightCard><div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div></LightCard>
      ) : reviews.length === 0 ? (
        <LightCard>
          <EmptyState light icon={MessageSquare} title="Bu filtrede yorum yok"
            hint="Müşteriler teslim aldıkları kutulara puan verdikçe yorumlar burada listelenir." />
        </LightCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatePresence initial={false}>
            {reviews.map((r, i) => (
              <motion.div
                key={r._id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
              >
                <LightCard interactive className="flex h-full flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {r.business ? `${r.business.name}${r.business.branchName ? ` - ${r.business.branchName}` : ''}` : 'Silinmiş işletme'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {r.user?.name || 'Silinmiş kullanıcı'}
                        <span className="mx-1 text-gray-300">·</span>{r.user?.email || '—'}
                      </p>
                    </div>
                    <Stars rating={r.rating} />
                  </div>

                  <p className={`flex-1 text-sm leading-relaxed ${r.comment ? 'text-gray-600' : 'italic text-gray-300'}`}>
                    {r.comment ? `"${r.comment}"` : 'Yorum yazılmamış — yalnızca puan.'}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-[11px] text-gray-400">{formatDateTime(r.createdAt)}</span>
                    <DangerButton onClick={() => remove(r)} disabled={busyId === r._id} className="px-3 py-1.5">
                      <Trash2 className="h-3.5 w-3.5" /> Sil
                    </DangerButton>
                  </div>
                </LightCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <GhostButton onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="p-2">
            <ChevronLeft className="h-4 w-4" />
          </GhostButton>
          <span className="text-xs text-gray-400">sayfa {data.page}/{data.totalPages}</span>
          <GhostButton onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages} className="p-2">
            <ChevronRight className="h-4 w-4" />
          </GhostButton>
        </div>
      )}
    </div>
  );
}
