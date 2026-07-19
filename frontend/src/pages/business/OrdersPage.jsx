// Siparişlerim: işletmenin tüm siparişlerini sayfalı listeleme.
// Veri kaynağı: GET /business/orders (sayfalı, dinamik).
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Clock, CheckCircle2, XCircle, AlertTriangle,
  ChevronLeft, ChevronRight, User, Search, Filter,
} from 'lucide-react';
import * as businessService from '../../services/businessService';
import { apiErrorMessage } from '../../services/api';
import { LightCard, Spinner, useToasts, ToastStack } from '../../components/admin/AdminUI';

const tl = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });

const STATUS_MAP = {
  RESERVED: { label: 'Rezerve', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  PAID: { label: 'Ödendi', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle2 },
  PICKED_UP: { label: 'Teslim Edildi', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  EXPIRED: { label: 'Süresi Doldu', color: 'text-gray-500 bg-gray-50 border-gray-200', icon: XCircle },
  REFUNDED: { label: 'İade Edildi', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: AlertTriangle },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function OrdersPage() {
  const { toasts, push } = useToasts();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const result = await businessService.getAllOrders(page, 20);
      setOrders(result.orders.map(o => ({
        id: o._id,
        customerName: o.user?.name || 'Misafir',
        customerEmail: o.user?.email || '',
        amount: o.amount,
        status: o.status,
        createdAt: o.createdAt,
      })));
      setPagination({ page: result.page, pages: result.totalPages, total: result.totalOrders });
    } catch (err) {
      push(apiErrorMessage(err, 'Siparişler yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => { load(1); }, [load]);

  const filtered = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Siparişlerim</h1>
          <p className="mt-1 text-sm text-gray-500">
            Toplam {pagination.total} sipariş
          </p>
        </div>

        {/* Durum Filtresi */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ALL', label: 'Tümü' },
            { key: 'PAID', label: 'Ödendi' },
            { key: 'PICKED_UP', label: 'Teslim' },
            { key: 'RESERVED', label: 'Rezerve' },
            { key: 'EXPIRED', label: 'Süresi Doldu' },
            { key: 'REFUNDED', label: 'İade' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                statusFilter === f.key
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tablo */}
      <LightCard className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 rounded-2xl bg-gray-50 p-4">
              <ShoppingBag className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">
              {statusFilter === 'ALL' ? 'Henüz sipariş yok' : 'Bu durumda sipariş bulunamadı'}
            </p>
          </div>
        ) : (
          <>
            {/* Tablo başlığı */}
            <div className="hidden border-b border-gray-100 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 sm:grid sm:grid-cols-12 sm:gap-4">
              <span className="col-span-4">Müşteri</span>
              <span className="col-span-2">Tutar</span>
              <span className="col-span-3">Tarih</span>
              <span className="col-span-3 text-right">Durum</span>
            </div>

            {/* Satırlar */}
            <AnimatePresence>
              {filtered.map((order, idx) => {
                const status = STATUS_MAP[order.status] || STATUS_MAP.RESERVED;
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.02 } }}
                    exit={{ opacity: 0 }}
                    className="group grid grid-cols-1 items-center gap-2 border-b border-gray-50 px-5 py-3.5 transition-colors duration-150 last:border-0 hover:bg-gray-50/80 sm:grid-cols-12 sm:gap-4"
                  >
                    {/* Müşteri */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">{order.customerName}</p>
                        {order.customerEmail && (
                          <p className="truncate text-[11px] text-gray-400">{order.customerEmail}</p>
                        )}
                      </div>
                    </div>

                    {/* Tutar */}
                    <div className="col-span-2">
                      <p className="text-sm font-bold text-gray-900">{tl.format(order.amount)}</p>
                    </div>

                    {/* Tarih */}
                    <div className="col-span-3">
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>

                    {/* Durum */}
                    <div className="col-span-3 flex justify-start sm:justify-end">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </>
        )}
      </LightCard>

      {/* Sayfalama */}
      {pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => load(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 transition-all duration-200 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Önceki
          </button>
          <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => load(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 transition-all duration-200 hover:bg-gray-50 disabled:opacity-40"
          >
            Sonraki <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
