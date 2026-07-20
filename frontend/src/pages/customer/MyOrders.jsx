// Siparişlerim — kullanıcının rezervasyon/sipariş geçmişi. PAID siparişlerde
// teslim QR kodu modalda gösterilir (işletme kamerayla okutup teslim eder).
// Güvenlik: backend yalnızca req.auth.id'nin siparişlerini döndürür (IDOR yok).
import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ShoppingBag, Loader2, Clock, X, QrCode, Star } from 'lucide-react';
import * as customerService from '../../services/customerService';
import { apiErrorMessage } from '../../services/api';

const STATUS_META = {
  RESERVED:  { label: 'Ödeme bekliyor', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  PAID:      { label: 'Teslime hazır',  cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  PICKED_UP: { label: 'Teslim edildi',  cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  EXPIRED:   { label: 'Süresi doldu',   cls: 'bg-gray-100 text-gray-500 ring-gray-200' },
  REFUNDED:  { label: 'İade edildi',    cls: 'bg-violet-50 text-violet-700 ring-violet-200' },
};

export default function MyOrders() {
  const { authed } = useOutletContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrOrder, setQrOrder] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await customerService.myOrders());
    } catch (err) {
      setError(apiErrorMessage(err, 'Siparişler yüklenemedi.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authed) { navigate('/kesfet/giris?redirect=/kesfet/siparislerim'); return; }
    load();
  }, [authed, load, navigate]);

  if (!authed) return null;

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
        <ShoppingBag className="h-6 w-6 text-emerald-600" /> Siparişlerim
      </h1>
      <p className="mt-1 text-sm text-gray-500">Rezervasyonların ve teslim kodların burada.</p>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">{error}</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <ShoppingBag className="h-12 w-12 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">Henüz siparişin yok</p>
          <p className="text-xs text-gray-400">Keşfetten bir sürpriz kutu seç, ilk siparişini ver.</p>
          <button onClick={() => navigate('/kesfet')} className="mt-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">Keşfete git</button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o, i) => {
            const meta = STATUS_META[o.status] || STATUS_META.EXPIRED;
            return (
              <motion.div
                key={o._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i * 0.04, 0.3) } }}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <ShoppingBag className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">{o.business?.name || 'İşletme'}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {o.box?.pickupStart ? `Teslim ${o.box.pickupStart}-${o.box.pickupEnd}` : (o.box?.date || '—')}
                    </p>
                  </div>
                </div>

                <span className="font-black text-gray-900">{o.amount} ₺</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${meta.cls}`}>{meta.label}</span>

                {o.status === 'PAID' && o.qrToken && (
                  <button
                    onClick={() => setQrOrder(o)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-500 active:scale-95"
                  >
                    <QrCode className="h-3.5 w-3.5" /> QR Göster
                  </button>
                )}
                {o.status === 'PICKED_UP' && (
                  <button
                    onClick={() => navigate('/kesfet')}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-50"
                  >
                    <Star className="h-3.5 w-3.5" /> Değerlendir
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* QR modal */}
      <AnimatePresence>
        {qrOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setQrOrder(null)} className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 text-center shadow-2xl"
            >
              <button onClick={() => setQrOrder(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
              <h2 className="text-lg font-bold text-gray-900">Teslim Kodu</h2>
              <p className="mt-1 text-xs text-gray-500">{qrOrder.business?.name} — bu kodu görevliye okut</p>
              <div className="mx-auto mt-5 w-fit rounded-2xl border border-gray-100 bg-white p-4 shadow-inner">
                <QRCodeSVG value={qrOrder.qrToken} size={200} level="M" />
              </div>
              <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                Bu kod tek kullanımlıktır. Yalnızca teslim anında göster.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
