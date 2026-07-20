// Müşteri uygulaması telefon önizlemesi — TEK kaynak.
// İşletme panelindeki Vitrin Yönetimi ve admin panelindeki Kutu & Vitrin
// sekmesi aynı bileşeni kullanır; müşteri UI'ı iki yerde asla ayrışmaz.
//
// Tüm veriler prop'tan gelir (hardcode yok): fiyat/saat/adres canlı kutu ya da
// profil verisinden hesaplanıp buraya verilir. onCoverClick verilirse kapak
// alanı tıklanabilir olur (vitrin editöründe fotoğraf yükleme); verilmezse
// salt-okunur önizlemedir (admin).
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImagePlus, Clock, Star, Image as ImageIcon,
  MapPin, Heart, Map, UserRound, Leaf, X,
} from 'lucide-react';
import { typeLabel } from '../admin/AdminUI';
import { BOX_CONTENTS as CONTENTS } from '../../data/boxContents';

function CoverArea({ coverUrl, onCoverClick, heightCls }) {
  const inner = (
    <>
      {coverUrl ? (
        <AnimatePresence mode="wait">
          <motion.img
            key={coverUrl}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            src={coverUrl} alt="kapak"
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
      ) : (
        <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-gray-300 transition-colors duration-300 group-hover/cover:text-emerald-500">
          <ImageIcon className="h-6 w-6" />
          <span className="text-[10px] font-medium">
            {onCoverClick ? 'Kapak fotoğrafı yüklemek için tıkla' : 'Kapak fotoğrafı yok'}
          </span>
        </span>
      )}
      {coverUrl && onCoverClick && (
        <span className="absolute inset-0 flex items-center justify-center bg-gray-900/0 opacity-0 transition-all duration-300 group-hover/cover:bg-gray-900/35 group-hover/cover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-gray-800 shadow-lg">
            <ImagePlus className="h-3 w-3" /> Kapağı değiştir
          </span>
        </span>
      )}
    </>
  );

  if (!onCoverClick) {
    return <div className={`relative block w-full overflow-hidden bg-gray-100 ${heightCls}`}>{inner}</div>;
  }
  return (
    <button
      type="button"
      onClick={onCoverClick}
      className={`group/cover relative block w-full overflow-hidden bg-gray-100 ${heightCls}`}
      title="Kapak fotoğrafı yükle"
    >
      {inner}
    </button>
  );
}

export default function PhonePreview({
  view = 'detay',          // 'liste' (Keşfet kartı) | 'detay' (mağaza sayfası)
  name = '',
  logoUrl = '',
  coverUrl = '',
  detailUrl = '',
  description = '',
  contents = [],
  price = null,
  originalPrice = null,
  pickupStart = null,
  pickupEnd = null,
  addressLine = '',
  mapsUrl = '',            // doluysa "Yol Tarifi Al" görünür (gerçek müşteri sayfasıyla aynı)
  locationLine = '',
  district = '',
  businessType = '',
  remaining = null,
  onCoverClick,            // opsiyonel — vitrin editöründe kapak yükleme
}) {
  const [showMapModal, setShowMapModal] = useState(false);

  return (
    <div className="relative mx-auto w-[320px] rounded-[3rem] border-[12px] border-gray-900 bg-gray-900 shadow-2xl">
      <div className="absolute left-1/2 top-2.5 z-20 h-[26px] w-28 -translate-x-1/2 rounded-full bg-gray-900" />
      <div className="absolute -left-[15px] top-24 h-10 w-[3px] rounded-l bg-gray-800" />
      <div className="absolute -left-[15px] top-40 h-14 w-[3px] rounded-l bg-gray-800" />
      <div className="absolute -right-[15px] top-32 h-16 w-[3px] rounded-r bg-gray-800" />

      {/* Ekran — iki görünüm arasında animasyonlu geçiş */}
      <div className="relative h-[640px] overflow-hidden rounded-[2.3rem] bg-[#faf8f5]">
        <AnimatePresence mode="wait">
        {view === 'liste' ? (
          /* ---------- ANASAYFA (Keşfet listesi) — kutu kartı ---------- */
          <motion.div
            key="liste"
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative h-full"
          >
            <div className="h-full overflow-y-auto pb-20 text-left">
              {/* Konum başlığı — kayıttaki ilçe/il */}
              <div className="flex items-center gap-2.5 px-4 pt-10">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                </span>
                <div>
                  <p className="text-[10px] text-gray-400">Seçilen Konum</p>
                  <p className="text-sm font-bold text-gray-900">{locationLine || 'Konum'} ⌄</p>
                </div>
              </div>

              {/* Filtre çipleri (uygulama iskeleti) */}
              <div className="mt-3.5 flex gap-2 px-4">
                <span className="rounded-full bg-emerald-800 px-4 py-1.5 text-xs font-semibold text-white">Tümü</span>
                <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-500">Yemekler</span>
                <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-500">Unlu Mamüller</span>
              </div>

              <div className="mt-4 flex items-baseline justify-between px-4">
                <h3 className="text-lg font-black text-gray-900">Sizin için seçilenler</h3>
                <span className="text-xs font-bold text-emerald-700">Tümünü gör</span>
              </div>

              {/* SÜRPRİZ KUTU KARTI — tüm veriler canlı */}
              <div className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-200/70">
                <div className="relative">
                  <CoverArea coverUrl={coverUrl} onCoverClick={onCoverClick} heightCls="h-32" />
                  {remaining !== null && remaining <= 3 && (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-gray-800 shadow">
                      Hızla tükeniyor
                    </span>
                  )}
                  <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 shadow ring-1 ring-inset ring-emerald-100/50">
                    <Star className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" /> Yeni
                  </span>
                </div>
                <div className="p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {/* Logo — yuvarlak avatar, işletme adının yanında */}
                      <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-emerald-50 shadow-sm">
                        {logoUrl ? (
                          <img src={logoUrl} alt="logo" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[11px] font-black text-emerald-600">
                            {(name || '?').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </span>
                      <p className="truncate text-base font-bold text-gray-900">{name || 'İşletme adı'}</p>
                    </div>
                    <Heart className="h-5 w-5 shrink-0 text-gray-300" />
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {contents.includes('vegan') ? 'Sürpriz Kutu (Vejetaryen)' : 'Sürpriz Kutu'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {pickupStart && pickupEnd
                      ? <>Bugün {pickupStart} - {pickupEnd}</>
                      : <span className="italic text-gray-300">Teslim saati tanımsız</span>}
                    {district ? ` · ${district}` : ''}
                  </p>
                  {contents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {contents.map((key) => {
                        const c = CONTENTS.find((x) => x.key === key);
                        return (
                          <motion.span
                            key={key}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100"
                          >
                            {c?.emoji} {c?.short}
                          </motion.span>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-3 flex items-baseline justify-end gap-1.5 border-t border-dashed border-gray-200 pt-2.5">
                    {originalPrice !== null && <span className="text-xs text-gray-300 line-through">{originalPrice} ₺</span>}
                    <span className="text-lg font-black text-emerald-700">{price !== null ? `${price} ₺` : '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alt tab bar (uygulama iskeleti) */}
            <div className="absolute inset-x-0 bottom-0 flex items-start justify-around border-t border-gray-100 bg-white px-2 pb-5 pt-2.5">
              {[
                { icon: Leaf, label: 'Keşfet', active: true },
                { icon: Map, label: 'Göz At' },
                { icon: Heart, label: 'Favoriler' },
                { icon: UserRound, label: 'Profil' },
              ].map((t) => (
                <span key={t.label} className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${t.active ? 'text-emerald-800' : 'text-gray-400'}`}>
                  <t.icon className="h-5 w-5" /> {t.label}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ---------- MAĞAZA DETAYI (prototype.html UI) ---------- */
          <motion.div
            key="detay"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative h-full"
          >
            <div className="h-full overflow-y-auto pb-24 text-left">
              {/* Üst bar */}
              <div className="sticky top-0 z-10 flex items-center justify-between bg-[#faf8f5]/95 px-4 pb-2 pt-9 backdrop-blur">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow">←</span>
                <p className="text-sm font-bold text-gray-900">Mağaza detayları</p>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow">↗</span>
              </div>

              {/* Kapak — tam genişlik */}
              <CoverArea coverUrl={detailUrl || coverUrl} onCoverClick={onCoverClick} heightCls="h-40" />

              {/* İçerik */}
              <div className="px-4 pt-4">
                {/* İsim + rozet */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {logoUrl && (
                      <img src={logoUrl} alt="logo" className="h-10 w-10 shrink-0 rounded-xl border border-gray-100 object-cover shadow-sm" />
                    )}
                    <h3 className="truncate text-xl font-bold text-gray-900">{name || 'İşletme adı'}</h3>
                  </div>
                  {remaining !== null && remaining <= 3 && (
                    <span className="mt-1 shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-500">
                      Hızla tükeniyor
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  {contents.includes('vegan') ? 'Vejetaryen sürpriz kutu' : 'Sürpriz kutu'}
                  {businessType ? ` · ${typeLabel(businessType)}` : ''}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm">
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-100/50">
                    <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" /> Yeni
                  </span>
                  <span className="text-gray-400 text-xs">Henüz değerlendirme yok</span>
                </p>

                {/* Kutuda ne olabilir? */}
                <h4 className="mt-5 text-sm font-bold text-gray-900">🎒 Kutuda ne olabilir?</h4>
                <p className={`mt-1.5 text-sm leading-relaxed ${description ? 'text-gray-500' : 'italic text-gray-300'}`}>
                  {description || 'Açıklama burada görünecek…'}
                </p>
                {contents.length > 0 && (
                  <ul className="mt-2.5 space-y-1.5">
                    {contents.map((key) => {
                      const c = CONTENTS.find((x) => x.key === key);
                      return (
                        <motion.li
                          key={key}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-2 text-sm text-gray-500"
                        >
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
                          {c?.emoji} {c?.long}
                        </motion.li>
                      );
                    })}
                  </ul>
                )}

                {/* Teslim alma — dinamik saatler */}
                <h4 className="mt-5 flex items-center gap-1.5 text-sm font-bold text-gray-900">
                  <Clock className="h-4 w-4 text-gray-400" /> Teslim alma
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {pickupStart && pickupEnd
                    ? <>Bugün {pickupStart} – {pickupEnd} · Kendi çantanı getirmeyi unutma!</>
                    : <span className="italic text-gray-300">Teslim saati tanımsız</span>}
                </p>

                {/* Konum — dinamik adres */}
                <h4 className="mt-5 flex items-center justify-between text-sm font-bold text-gray-900">
                  <span>📍 Konum</span>
                  {mapsUrl && <span className="text-xs font-medium text-emerald-600">Yol Tarifi Al</span>}
                </h4>
                <p className="mt-1 text-sm font-bold text-gray-800">{name || '—'}</p>
                <p className={`text-sm ${addressLine ? 'text-gray-500' : 'italic text-gray-300'}`}>
                  {addressLine || 'Adres bilgisi kayıttan gelir'}
                </p>
                {addressLine && (
                  <div className="mt-3 relative h-[140px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 group cursor-pointer">
                    <div 
                      className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/0 transition-all duration-300 group-hover:bg-gray-900/10"
                      onClick={() => setShowMapModal(true)}
                    >
                      <div className="opacity-0 translate-y-2 transform rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-gray-900 shadow-lg transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        Büyütmek için tıkla
                      </div>
                    </div>
                    <iframe
                      title="İşletme Konumu"
                      width="100%"
                      height="100%"
                      className="pointer-events-none"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(addressLine)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                  </div>
                )}
              </div>
            </div>

            {/* Yapışkan alt bar — üstü çizili fiyat + Rezerve et */}
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 border-t border-gray-100 bg-white px-4 pb-6 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
              <div className="shrink-0">
                {originalPrice !== null && <p className="text-xs text-gray-300 line-through">{originalPrice} ₺</p>}
                <p className="text-xl font-black leading-tight text-emerald-800">
                  {price !== null ? `${price} ₺` : '—'}
                </p>
              </div>
              <div className="flex-1 rounded-full bg-emerald-800 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-800/25">
                Rezerve et
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* ---------- Harita Modalı (Telefon İçi) ---------- */}
        <AnimatePresence>
          {showMapModal && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute inset-0 z-50 flex flex-col bg-white"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 pb-3 pt-10">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <MapPin className="h-4 w-4 text-emerald-600" /> Konum
                </h3>
                <button 
                  onClick={() => setShowMapModal(false)} 
                  className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <iframe
                  title="İşletme Konumu Büyük"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(addressLine)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
