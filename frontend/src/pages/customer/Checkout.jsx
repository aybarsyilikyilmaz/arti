// Ödeme ekranı (DEMO/mock) — gerçek para çekilmez. Sipariş rezervasyondan sonra
// buraya gelir; "Ödemeyi Tamamla" backend mock ucunu çağırıp siparişi PAID yapar,
// QR üretilir. Gerçek sağlayıcı bağlanınca bu ekran yerini iyzico/PayTR sayfasına
// bırakır (mock ucu prod'da mount edilmez).
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Loader2, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import * as customerService from '../../services/customerService';
import { apiErrorMessage } from '../../services/api';

export default function Checkout() {
  const navigate = useNavigate();
  const state = useLocation().state;

  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState((state?.expiresInMinutes || 15) * 60);

  // Rezervasyon geri sayımı
  useEffect(() => {
    if (done) return undefined;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [done]);

  // Doğrudan bu adrese gelinmişse (sipariş yok) keşfete dön
  if (!state?.paymentRef) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm font-semibold text-gray-700">Ödenecek aktif bir rezervasyon bulunamadı.</p>
        <button onClick={() => navigate('/kesfet')} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Keşfete dön</button>
      </div>
    );
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const pay = async () => {
    setPaying(true);
    setError('');
    try {
      const res = await customerService.completeMockPayment(state.paymentRef, true);
      if (res.outcome === 'PAID') {
        setDone(true);
      } else {
        setError(`Ödeme tamamlanamadı (${res.outcome}). Rezervasyonun süresi dolmuş olabilir.`);
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Ödeme işlenemedi.'));
    } finally {
      setPaying(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </motion.div>
        <h1 className="mt-5 text-2xl font-bold text-gray-900">Siparişin onaylandı! 🎉</h1>
        <p className="mt-2 text-sm text-gray-500">
          {state.box?.name} için rezervasyonun hazır. Teslim sırasında göstereceğin QR kodun oluşturuldu.
        </p>
        <button onClick={() => navigate('/kesfet/siparislerim')}
          className="mt-6 w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:-translate-y-0.5 hover:bg-emerald-500 active:scale-95">
          QR Kodumu Göster
        </button>
        <button onClick={() => navigate('/kesfet')} className="mt-2 w-full py-2 text-sm font-medium text-gray-400 hover:text-gray-600">
          Keşfete dön
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ödeme</h1>
      <p className="mt-1 text-sm text-gray-500">Rezervasyonunu tamamlamak için ödemeyi onayla.</p>

      {/* Geri sayım */}
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
        <Clock className="h-4 w-4" />
        Rezervasyon süresi: <b className="font-bold tabular-nums">{mm}:{ss}</b>
      </div>

      {/* Özet */}
      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{state.box?.name || 'Sürpriz Kutu'}</span>
          <span className="font-semibold text-gray-900">{state.amount} ₺</span>
        </div>
        {state.box?.pickupStart && (
          <p className="mt-1 text-xs text-gray-400">Teslim: bugün {state.box.pickupStart}–{state.box.pickupEnd}</p>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-sm font-bold text-gray-900">Toplam</span>
          <span className="text-xl font-black text-emerald-700">{state.amount} ₺</span>
        </div>
      </div>

      {/* Demo kart formu (görsel — gerçek işlem yapmaz) */}
      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
          <CreditCard className="h-4 w-4 text-emerald-600" /> Kart Bilgileri
          <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">DEMO</span>
        </div>
        <div className="space-y-2.5 opacity-70">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-400">4242 4242 4242 4242</div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-400">12/28</div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-400">CVC 123</div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-gray-400">Bu bir demo ödemedir — gerçek kart bilgisi girmeyin, ücret alınmaz.</p>
      </div>

      {error && <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">{error}</p>}

      <button onClick={pay} disabled={paying || secondsLeft === 0}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 active:scale-95 disabled:pointer-events-none disabled:opacity-50">
        {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Lock className="h-4 w-4" /> {state.amount} ₺ Öde</>}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 256-bit şifreleme ile korunur
      </p>
    </div>
  );
}
