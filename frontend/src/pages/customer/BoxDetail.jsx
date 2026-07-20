// Kutu detayı — masaüstünde iki kolon (sol: bilgi, sağ: sticky sipariş kutusu),
// mobilde tek kolon + sabit alt sipariş barı. Veri route state'inden gelir;
// sayfa yenilenmişse GET /boxes/:id ile taze çekilir.
// "Rezerve Et" girişsizse login'e yönlendirir; girişliyse checkout başlatır.
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, Clock, MapPin, Package, Loader2, Image as ImageIcon, ShieldCheck,
} from 'lucide-react';
import * as customerService from '../../services/customerService';
import { apiErrorMessage } from '../../services/api';
import { BOX_CONTENTS as CONTENTS } from '../../data/boxContents';

export default function BoxDetail() {
  const { id } = useParams();
  const routeState = useLocation().state;
  const navigate = useNavigate();
  const { authed } = useOutletContext();

  const [box, setBox] = useState(routeState?.box || null);
  const [loading, setLoading] = useState(!routeState?.box);
  const [error, setError] = useState('');
  const [ordering, setOrdering] = useState('');

  useEffect(() => {
    // State'ten gelen kart özeti populate içermiyor olabilir → her zaman taze çek
    let alive = true;
    customerService.getBox(id)
      .then((b) => { if (alive) setBox(b); })
      .catch((err) => { if (alive && !routeState?.box) setError(apiErrorMessage(err, 'Kutu bulunamadı.')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const reserve = async () => {
    if (!authed) {
      navigate(`/kesfet/giris?redirect=${encodeURIComponent(`/kesfet/kutu/${id}`)}`);
      return;
    }
    setOrdering('...');
    setError('');
    try {
      const res = await customerService.checkout(id);
      // Ödeme ekranına sipariş özetini taşı
      navigate('/kesfet/odeme', {
        state: {
          orderId: res.orderId,
          paymentRef: res.paymentRef,
          amount: res.amount,
          expiresInMinutes: res.expiresInMinutes,
          box: { name: biz.name, pickupStart: box.pickupStart, pickupEnd: box.pickupEnd },
        },
      });
    } catch (err) {
      setError(apiErrorMessage(err, 'Rezervasyon yapılamadı.'));
      setOrdering('');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }
  if (error && !box) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-sm font-semibold text-gray-700">{error}</p>
        <Link to="/kesfet" className="mt-4 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Keşfete dön</Link>
      </div>
    );
  }
  if (!box) return null;

  const biz = box.business || {};
  const contents = box.contents || [];
  const soldOut = box.remaining <= 0;
  const scarce = box.remaining > 0 && box.remaining <= 3;
  const addressLine = [biz.address, biz.district, biz.city].filter(Boolean).join(', ');

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> Geri
      </button>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        {/* ---------- Sol: bilgi ---------- */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Kapak */}
          <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-gray-100 sm:h-72">
            {(biz.detailUrl || biz.coverUrl) ? (
              <img src={biz.detailUrl || biz.coverUrl} alt={biz.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300"><ImageIcon className="h-10 w-10" /></div>
            )}
            {scarce && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-rose-600 shadow">Son {box.remaining} kutu</span>}
          </div>

          {/* Başlık */}
          <div className="mt-5 flex items-start gap-3">
            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-emerald-50 shadow-sm">
              {biz.logoUrl ? <img src={biz.logoUrl} alt="" className="h-full w-full object-cover" />
                : <span className="flex h-full w-full items-center justify-center text-lg font-black text-emerald-600">{(biz.name || '?').charAt(0).toUpperCase()}</span>}
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{biz.name || box.businessName}</h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-500">4.4</span>
                <span>(120+ değerlendirme)</span>
              </p>
            </div>
          </div>

          {/* Kutuda ne olabilir */}
          <section className="mt-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900"><Package className="h-4 w-4 text-emerald-600" /> Kutuda ne olabilir?</h2>
            {biz.description && <p className="mt-2 text-sm leading-relaxed text-gray-600">{biz.description}</p>}
            {contents.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {contents.map((key) => {
                  const c = CONTENTS.find((x) => x.key === key);
                  if (!c) return null;
                  return (
                    <li key={key} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span>{c.emoji} {c.long}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Teslim + konum */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-900"><Clock className="h-4 w-4 text-gray-400" /> Teslim alma</h3>
              <p className="mt-1.5 text-sm text-gray-600">
                {box.pickupStart && box.pickupEnd ? <>Bugün {box.pickupStart} – {box.pickupEnd}</> : 'Saat belirtilmemiş'}
              </p>
              <p className="mt-1 text-xs text-gray-400">Kendi çantanı getirmeyi unutma!</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <h3 className="flex items-center justify-between text-sm font-bold text-gray-900">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> Konum</span>
                {biz.mapsUrl && (
                  <a href={biz.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline">
                    Yol Tarifi Al
                  </a>
                )}
              </h3>
              <p className="mt-1.5 text-sm text-gray-600">{addressLine || 'Adres belirtilmemiş'}</p>
              {addressLine && (
                <div className="mt-3 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  <iframe
                    title="İşletme Konumu"
                    width="100%"
                    height="180"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(addressLine)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              )}
            </div>
          </section>
        </motion.div>

        {/* ---------- Sağ: sticky sipariş kutusu (masaüstü) ---------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/60">
            <p className="text-sm text-gray-500">Sürpriz Kutu</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700">{box.price} ₺</span>
              {box.originalPrice != null && <span className="text-sm text-gray-300 line-through">{box.originalPrice} ₺</span>}
            </div>
            {box.originalPrice > box.price && (
              <p className="mt-1 text-xs font-semibold text-emerald-600">%{Math.round((1 - box.price / box.originalPrice) * 100)} tasarruf ediyorsun</p>
            )}

            <OrderButton soldOut={soldOut} ordering={ordering} onReserve={reserve} authed={authed} />

            {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}

            <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-gray-400">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              Ödemen güvence altında. Rezervasyon sonrası teslim için QR kodun oluşur.
            </p>
          </div>
        </aside>
      </div>

      {/* ---------- Mobil sabit alt bar ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-gray-100 bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="shrink-0">
          {box.originalPrice != null && <p className="text-xs text-gray-300 line-through">{box.originalPrice} ₺</p>}
          <p className="text-xl font-black leading-tight text-emerald-700">{box.price} ₺</p>
        </div>
        <div className="flex-1">
          <OrderButton soldOut={soldOut} ordering={ordering} onReserve={reserve} authed={authed} compact />
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </div>
  );
}

function OrderButton({ soldOut, ordering, onReserve, authed, compact }) {
  if (soldOut) {
    return (
      <button disabled className={`${compact ? '' : 'mt-5 w-full'} cursor-not-allowed rounded-full bg-gray-200 py-3.5 text-center text-sm font-bold text-gray-400 ${compact ? 'w-full' : ''}`}>
        Tükendi
      </button>
    );
  }
  return (
    <button
      onClick={onReserve}
      disabled={Boolean(ordering)}
      className={`${compact ? 'w-full' : 'mt-5 w-full'} flex items-center justify-center gap-2 rounded-full bg-emerald-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 active:scale-95 disabled:pointer-events-none disabled:opacity-60`}
    >
      {ordering ? <Loader2 className="h-4 w-4 animate-spin" /> : authed ? 'Rezerve Et' : 'Giriş yap ve rezerve et'}
    </button>
  );
}
