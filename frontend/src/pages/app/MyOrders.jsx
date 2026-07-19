// Siparişlerim: teslime hazır siparişin QR kodu burada gösterilir.
// RESERVED siparişlerde ödeme buradan da tamamlanabilir (mock akışı).
import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ShoppingBag, Clock, Loader2, CreditCard } from 'lucide-react';
import * as userService from '../../services/userService';
import { apiErrorMessage } from '../../services/api';
import {
  GlassCard, StatusBadge, Spinner, EmptyState, useToasts, ToastStack, formatDateTime,
} from '../../components/admin/AdminUI';

export default function MyOrders() {
  const { authed, restoring } = useOutletContext();
  const { toasts, push } = useToasts();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await userService.myOrders());
    } catch (err) {
      push(apiErrorMessage(err, 'Siparişler yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  if (!restoring && !authed) return <Navigate to="/app/giris" replace />;

  const payNow = async (order) => {
    setPayingId(order._id);
    try {
      const paymentRef = order.paymentRef;
      const res = await userService.completeMockPayment(paymentRef, true);
      if (res.outcome !== 'PAID') throw new Error(`Ödeme tamamlanamadı (${res.outcome}).`);
      push('Ödeme alındı — QR kodun hazır! 🎉');
      await load();
    } catch (err) {
      push(apiErrorMessage(err, err.message || 'Ödeme başarısız.'), 'error');
    } finally {
      setPayingId('');
    }
  };

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">Siparişlerim</h1>
        <p className="mt-0.5 text-xs text-slate-500">Teslim saatinde QR kodu işletmeye okut</p>
      </div>

      {loading ? (
        <GlassCard><div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div></GlassCard>
      ) : orders.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={ShoppingBag}
            title="Henüz siparişin yok"
            hint="Keşfet'ten bir sürpriz kutu rezerve et — hem cebin hem gezegen kazansın."
          />
        </GlassCard>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {orders.map((o, i) => (
              <motion.div
                key={o._id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
              >
                <GlassCard className="overflow-hidden">
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{o.business?.name || 'İşletme'}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="h-3 w-3" />
                        {o.box?.pickupStart ? `Teslim ${o.box.pickupStart} – ${o.box.pickupEnd}` : formatDateTime(o.reservedAt)}
                        <span className="mx-1 text-slate-700">·</span>
                        <b className="text-slate-400">{o.amount} TL</b>
                      </p>
                    </div>
                    <StatusBadge status={o.status} pulse={o.status === 'PAID'} />
                  </div>

                  {/* Teslime hazır: QR kod */}
                  {o.status === 'PAID' && o.qrToken && (
                    <div className="border-t border-white/[0.06] bg-white/[0.02] p-5">
                      <div className="mx-auto w-fit rounded-2xl bg-white p-4 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
                        <QRCodeSVG value={o.qrToken} size={168} level="M" />
                      </div>
                      <p className="mt-3 text-center text-[11px] text-slate-500">
                        Bu kod tek kullanımlıktır — teslimatta işletme okutacak.
                      </p>
                    </div>
                  )}

                  {/* Ödeme bekliyor: tamamla */}
                  {o.status === 'RESERVED' && o.paymentRef && (
                    <div className="border-t border-white/[0.06] bg-white/[0.02] p-4">
                      <button
                        onClick={() => payNow(o)}
                        disabled={payingId === o._id}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(99,102,241,0.35)] transition-all duration-300 ease-in-out hover:bg-indigo-400 active:scale-95 active:duration-100 disabled:opacity-40"
                      >
                        {payingId === o._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CreditCard className="h-4 w-4" /> Ödemeyi Tamamla ({o.amount} TL)</>}
                      </button>
                      <p className="mt-2 text-center text-[10px] text-slate-600">
                        Rezervasyon 10 dk içinde ödenmezse stok geri açılır.
                      </p>
                    </div>
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
