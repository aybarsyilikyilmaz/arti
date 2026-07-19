// Keşfet: bugünün sürpriz kutuları. "Yakınımda" açılırsa konum izniyle
// yakınlık sıralı liste gelir. Rezervasyon akışı: kutu seç → rezerve et
// (10 dk stok kilidi) → mock ödeme → QR "Siparişlerim"de.
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Clock, MapPin, Sparkles, X, ShoppingBag, CreditCard,
  CheckCircle2, Loader2, PackageX, LocateFixed,
} from 'lucide-react';
import * as userService from '../../services/userService';
import { apiErrorMessage } from '../../services/api';
import { GlassCard, Spinner, EmptyState, useToasts, ToastStack } from '../../components/admin/AdminUI';

const CONTENT_LABELS = { unlu: 'Unlu Mamül', sicak: 'Sıcak Yemek', meze: 'Meze', manav: 'Manav', karisik: 'Karışık', vegan: 'Vegan' };
const tl = (v) => `${v} TL`;

export default function Discover() {
  const navigate = useNavigate();
  const { authed } = useOutletContext();
  const { toasts, push } = useToasts();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nearby, setNearby] = useState(false);
  const [favIds, setFavIds] = useState(new Set());
  const [selected, setSelected] = useState(null); // rezervasyon akışındaki kutu

  const load = useCallback(async (useLocation) => {
    setLoading(true);
    try {
      let params = {};
      if (useLocation) {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 }));
        params = { lat: pos.coords.latitude, lng: pos.coords.longitude, radiusKm: 10 };
      }
      setBoxes(await userService.listBoxes(params));
    } catch (err) {
      if (err?.code === 1) push('Konum izni verilmedi — tüm kutular listeleniyor.', 'error');
      else push(apiErrorMessage(err, 'Kutular yüklenemedi.'), 'error');
      if (useLocation) { setNearby(false); setBoxes(await userService.listBoxes().catch(() => [])); }
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => { load(nearby); }, [load, nearby]);

  useEffect(() => {
    if (!authed) { setFavIds(new Set()); return; }
    userService.listFavorites()
      .then((favs) => setFavIds(new Set(favs.map((f) => f._id))))
      .catch(() => {});
  }, [authed]);

  const toggleFav = async (box) => {
    if (!authed) { navigate('/app/giris'); return; }
    const id = box.business;
    const on = favIds.has(id);
    setFavIds((s) => { const n = new Set(s); on ? n.delete(id) : n.add(id); return n; }); // iyimser
    try {
      on ? await userService.removeFavorite(id) : await userService.addFavorite(id);
      if (!on) push(`${box.businessName} favorilere eklendi — kutu yayınlayınca haber vereceğiz! 💚`);
    } catch (err) {
      setFavIds((s) => { const n = new Set(s); on ? n.add(id) : n.delete(id); return n; }); // geri al
      push(apiErrorMessage(err), 'error');
    }
  };

  const startReserve = (box) => {
    if (!authed) { navigate('/app/giris'); return; }
    setSelected(box);
  };

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Bugünün Kutuları</h1>
          <p className="mt-0.5 text-xs text-slate-500">Tükenmeden kap, israfı önle 🌍</p>
        </div>
        <button
          onClick={() => setNearby((n) => !n)}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
            nearby
              ? 'bg-emerald-500/[0.16] text-emerald-300 ring-1 ring-inset ring-emerald-400/30 shadow-[0_0_16px_rgba(16,185,129,0.15)]'
              : 'bg-white/[0.04] text-slate-400 ring-1 ring-inset ring-white/10'
          }`}
        >
          <LocateFixed className="h-3.5 w-3.5" /> Yakınımda
        </button>
      </div>

      {loading ? (
        <GlassCard><div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div></GlassCard>
      ) : boxes.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={PackageX}
            title="Şu an aktif kutu yok"
            hint={nearby ? '10 km içinde kutu bulunamadı — Yakınımda filtresini kapatmayı dene.' : 'İşletmeler genellikle öğleden sonra kutu yayınlar. Favorilediğin işletmeler kutu açınca bildirim alırsın.'}
          />
        </GlassCard>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {boxes.map((box, i) => {
              const discount = Math.round((1 - box.price / box.originalPrice) * 100);
              const fav = favIds.has(box.business);
              return (
                <motion.div
                  key={box._id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                  exit={{ opacity: 0 }}
                >
                  <GlassCard interactive className="overflow-hidden">
                    {/* Üst şerit: işletme + favori */}
                    <div className="flex items-start justify-between gap-3 p-4 pb-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 rounded-xl bg-emerald-500/25 blur-md" />
                          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/25 to-slate-800/60 text-sm font-bold text-emerald-300">
                            {box.businessName?.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{box.businessName}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="h-3 w-3" /> Teslim {box.pickupStart} – {box.pickupEnd}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFav(box)}
                        className="rounded-full p-2 transition-all duration-300 ease-in-out hover:bg-white/[0.07] active:scale-90"
                        title={fav ? 'Favoriden çıkar' : 'Favorile'}
                      >
                        <Heart className={`h-5 w-5 transition-all duration-300 ${fav ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'text-slate-500'}`} />
                      </button>
                    </div>

                    {/* İçerik çipleri */}
                    <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                      {(box.contents || []).map((c) => (
                        <span key={c} className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-inset ring-white/10">
                          {CONTENT_LABELS[c] || c}
                        </span>
                      ))}
                    </div>

                    {/* Alt şerit: fiyat + stok + CTA */}
                    <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black tracking-tight text-emerald-400">{tl(box.price)}</span>
                          <span className="text-xs text-slate-600 line-through">{tl(box.originalPrice)}</span>
                          <span className="rounded-md bg-emerald-500/[0.14] px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">-%{discount}</span>
                        </div>
                        <p className={`mt-0.5 text-[11px] font-semibold ${box.remaining <= 2 ? 'text-amber-400' : 'text-slate-500'}`}>
                          {box.remaining <= 2 ? `Son ${box.remaining} kutu! 🔥` : `${box.remaining} kutu kaldı`}
                        </p>
                      </div>
                      <button
                        onClick={() => startReserve(box)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-emerald-950 shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_8px_28px_rgba(16,185,129,0.5)] active:scale-95 active:duration-100"
                      >
                        <ShoppingBag className="h-4 w-4" /> Rezerve Et
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Rezervasyon + ödeme akışı */}
      <AnimatePresence>
        {selected && (
          <ReserveSheet
            box={selected}
            onClose={() => setSelected(null)}
            onDone={() => { setSelected(null); load(nearby); navigate('/app/siparisler'); }}
            push={push}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* Alt sayfa (bottom sheet): özet → ödeme → başarı */
function ReserveSheet({ box, onClose, onDone, push }) {
  const [step, setStep] = useState('summary'); // summary | pay | done
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null); // {orderId, amount, paymentPageUrl, expiresInMinutes}
  const [error, setError] = useState('');

  const reserve = async () => {
    setBusy(true);
    setError('');
    try {
      const data = await userService.checkout(box._id);
      setOrder(data);
      setStep('pay');
    } catch (err) {
      setError(apiErrorMessage(err, 'Rezervasyon yapılamadı.'));
    } finally {
      setBusy(false);
    }
  };

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      const paymentRef = order.paymentPageUrl.split('/').pop();
      const res = await userService.completeMockPayment(paymentRef, true);
      if (res.outcome !== 'PAID') throw new Error(`Ödeme tamamlanamadı (${res.outcome}).`);
      setStep('done');
    } catch (err) {
      setError(apiErrorMessage(err, err.message || 'Ödeme başarısız.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={step === 'done' ? onDone : onClose}
        className="fixed inset-0 z-40 bg-[#070b14]/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md rounded-t-3xl border border-white/10 bg-[#0a101f]/95 p-6 pb-8 backdrop-blur-2xl shadow-[0_-24px_80px_rgba(2,6,23,0.8)]"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15" />

        {step === 'summary' && (
          <>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{box.businessName}</h2>
                <p className="mt-0.5 text-xs text-slate-500">Sürpriz kutu · teslim {box.pickupStart} – {box.pickupEnd}</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 text-slate-500 transition-all duration-300 hover:bg-white/[0.07] hover:text-white active:scale-95">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
              <div className="flex items-center gap-2 text-sm text-emerald-300">
                <Sparkles className="h-4 w-4" /> Ödenecek tutar
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-emerald-400">{tl(box.price)}</span>
                <span className="text-xs text-slate-600 line-through">{tl(box.originalPrice)}</span>
              </div>
            </div>
            <p className="mb-4 text-[11px] leading-relaxed text-slate-500">
              "Rezerve Et"e bastığında kutu <b className="text-slate-300">10 dakika</b> senin için kilitlenir.
              Süre içinde ödeme yapılmazsa stok otomatik geri açılır.
            </p>
            {error && <p className="mb-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300">{error}</p>}
            <button
              onClick={reserve} disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-emerald-950 shadow-[0_4px_24px_rgba(16,185,129,0.4)] transition-all duration-300 ease-in-out hover:bg-emerald-400 active:scale-95 active:duration-100 disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingBag className="h-4 w-4" /> Rezerve Et</>}
            </button>
          </>
        )}

        {step === 'pay' && (
          <>
            <div className="mb-5 text-center">
              <h2 className="text-lg font-bold text-white">Ödeme</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Kutu kilitlendi — <b className="text-amber-400">{order.expiresInMinutes} dakika</b> içinde tamamla
              </p>
            </div>
            {/* Mock kart görseli */}
            <div className="mb-5 rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-600/30 to-slate-900/60 p-5 shadow-[0_12px_40px_rgba(79,70,229,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="mb-6 flex items-center justify-between">
                <CreditCard className="h-6 w-6 text-indigo-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/60">Test Kartı</span>
              </div>
              <p className="font-mono text-sm tracking-[0.25em] text-slate-300">4242 4242 4242 4242</p>
              <div className="mt-3 flex justify-between text-[10px] text-slate-500">
                <span>DEMO KULLANICI</span><span>12/29 · 424</span>
              </div>
            </div>
            <p className="mb-4 text-center text-[11px] text-slate-600">
              Geliştirme ortamı: gerçek para çekilmez. Canlıda burada iyzico ödeme sayfası açılır.
            </p>
            {error && <p className="mb-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300">{error}</p>}
            <button
              onClick={pay} disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3.5 text-sm font-bold text-white shadow-[0_4px_24px_rgba(99,102,241,0.4)] transition-all duration-300 ease-in-out hover:bg-indigo-400 active:scale-95 active:duration-100 disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CreditCard className="h-4 w-4" /> {tl(order.amount)} Öde</>}
            </button>
          </>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center py-4 text-center">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
              className="relative mb-4"
            >
              <div className="absolute inset-0 rounded-full bg-emerald-500/40 blur-2xl" />
              <CheckCircle2 className="relative h-16 w-16 text-emerald-400" />
            </motion.div>
            <h2 className="text-lg font-bold text-white">Kutu senin! 🎉</h2>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
              Ödemen alındı. Teslim saatinde <b className="text-slate-300">{box.businessName}</b>'e git,
              Siparişlerim'deki QR kodu okut, kutunu kap.
            </p>
            <button
              onClick={onDone}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-emerald-950 shadow-[0_4px_24px_rgba(16,185,129,0.4)] transition-all duration-300 ease-in-out hover:bg-emerald-400 active:scale-95"
            >
              QR Kodumu Göster
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
