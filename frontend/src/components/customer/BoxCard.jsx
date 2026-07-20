// Keşfet/favoriler kutu kartı — responsive grid içinde kullanılır.
// Tüm veriler backend'den gelir (fiyat/stok denormalize). Kart tıklanınca
// kutu detayına gider; kalp favoriyi açar/kapar (girişsizse login'e yönlendirir).
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart, Clock, MapPin, Image as ImageIcon } from 'lucide-react';
import { BOX_CONTENTS as CONTENTS } from '../../data/boxContents';

export default function BoxCard({ box, index = 0, isFavorite = false, onToggleFavorite }) {
  const navigate = useNavigate();
  const biz = box.business || {};
  const name = biz.name || box.businessName || 'İşletme';
  const contents = box.contents || [];
  const soldOut = box.remaining <= 0;
  const scarce = box.remaining > 0 && box.remaining <= 3;

  const go = () => navigate(`/kesfet/kutu/${box._id}`, { state: { box } });

  const toggleFav = (e) => {
    e.stopPropagation();
    onToggleFavorite?.(biz._id || biz.id);
  };

  return (
    <motion.button
      type="button"
      onClick={go}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index * 0.04, 0.4) } }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-200/70"
    >
      {/* Kapak */}
      <div className="relative h-36 w-full overflow-hidden bg-gray-100">
        {biz.coverUrl ? (
          <img src={biz.coverUrl} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        {scarce && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-rose-600 shadow">
            Son {box.remaining} kutu
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-gray-900/50 text-sm font-bold text-white">Tükendi</span>
        )}
        <span className="absolute right-2.5 top-2.5 flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-gray-800 shadow">
          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> 4.4
        </span>
        {onToggleFavorite && (
          <button
            onClick={toggleFav}
            className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow transition hover:scale-110 active:scale-95"
            title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
          </button>
        )}
      </div>

      {/* Gövde */}
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-emerald-50">
            {biz.logoUrl ? (
              <img src={biz.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[11px] font-black text-emerald-600">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <p className="truncate text-base font-bold text-gray-900">{name}</p>
        </div>

        <p className="mt-1 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {box.pickupStart && box.pickupEnd ? `${box.pickupStart}-${box.pickupEnd}` : 'Saat belirtilmemiş'}
          </span>
          {biz.district && (
            <span className="ml-2 inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{biz.district}</span>
          )}
        </p>

        {contents.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {contents.map((key) => {
              const c = CONTENTS.find((x) => x.key === key);
              if (!c) return null;
              return (
                <span key={key} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                  {c.emoji} {c.short}
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex items-baseline justify-end gap-1.5 border-t border-dashed border-gray-200 pt-2.5">
          {box.originalPrice != null && <span className="text-xs text-gray-300 line-through">{box.originalPrice} ₺</span>}
          <span className="text-lg font-black text-emerald-700">{box.price != null ? `${box.price} ₺` : '—'}</span>
        </div>
      </div>
    </motion.button>
  );
}
