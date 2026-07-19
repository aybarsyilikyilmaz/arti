// Siparişler sekmesi — bu işletmeye ait tüm siparişler (aktif + geçmiş).
// Durum filtresi, sayfalama ve PAID siparişlerde iade aksiyonu.
import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronLeft, ChevronRight, Undo2 } from 'lucide-react';
import * as adminService from '../../../services/adminService';
import { apiErrorMessage } from '../../../services/api';
import {
  LightCard, StatusBadge, Spinner, EmptyState, GhostButton, DangerButton, formatDateTime,
} from '../../../components/admin/AdminUI';

const FILTERS = [
  { key: '', label: 'Tümü' },
  { key: 'RESERVED', label: 'Ödeme Bekleyen' },
  { key: 'PAID', label: 'Teslime Hazır' },
  { key: 'PICKED_UP', label: 'Teslim Edilen' },
  { key: 'EXPIRED', label: 'Süresi Dolan' },
  { key: 'REFUNDED', label: 'İade Edilen' },
];

export default function OrdersTab({ businessId, push }) {
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filter) params.status = filter;
      setData(await adminService.listBusinessOrders(businessId, params));
    } catch (err) {
      push(apiErrorMessage(err, 'Siparişler yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [businessId, filter, page, push]);

  useEffect(() => { load(); }, [load]);

  const refund = async (order) => {
    if (!window.confirm(`${order.amount} ₺ tutarındaki sipariş iade edilsin mi? Stok geri salınır.`)) return;
    setBusyId(order._id);
    try {
      const res = await adminService.refundOrder(order._id);
      push(res.message);
      await load();
    } catch (err) {
      push(apiErrorMessage(err), 'error');
    } finally {
      setBusyId('');
    }
  };

  const orders = data?.orders || [];

  return (
    <div>
      {/* Durum filtre çipleri */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className="relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95"
          >
            {filter === f.key && (
              <motion.span
                layoutId="orders-filter-pill"
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

      <LightCard className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div>
        ) : orders.length === 0 ? (
          <EmptyState light icon={ShoppingBag} title="Bu filtrede sipariş yok"
            hint="Müşteriler kutu rezerve ettikçe siparişler burada listelenir." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  <th className="px-5 py-3.5">Müşteri</th>
                  <th className="px-5 py-3.5">Kutu Günü</th>
                  <th className="px-5 py-3.5">Tutar</th>
                  <th className="px-5 py-3.5">Durum</th>
                  <th className="px-5 py-3.5">Tarih</th>
                  <th className="px-5 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-gray-50 transition-colors duration-200 hover:bg-gray-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-900">{o.user?.name || 'Misafir'}</p>
                      <p className="text-xs text-gray-400">{o.user?.email || '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{o.box?.date || '—'}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{o.amount} ₺</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.status} light /></td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{formatDateTime(o.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {o.status === 'PAID' && (
                        <DangerButton onClick={() => refund(o)} disabled={busyId === o._id} className="px-3 py-1.5">
                          <Undo2 className="h-3.5 w-3.5" /> İade Et
                        </DangerButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sayfalama */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5">
            <p className="text-xs text-gray-400">
              Toplam <b className="text-gray-600">{data.totalOrders}</b> sipariş · sayfa {data.page}/{data.totalPages}
            </p>
            <div className="flex gap-2">
              <GhostButton onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="p-2">
                <ChevronLeft className="h-4 w-4" />
              </GhostButton>
              <GhostButton onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages} className="p-2">
                <ChevronRight className="h-4 w-4" />
              </GhostButton>
            </div>
          </div>
        )}
      </LightCard>
    </div>
  );
}
