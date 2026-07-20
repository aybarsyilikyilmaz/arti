// Keşfet — bugünün sürpriz kutuları (Yemeksepeti tarzı: sol filtre/sıralama
// paneli + responsive kart gridi). Kategori + arama + sıralama istemci tarafında
// uygulanır (liste küçük). Karta tıklama → kutu detayı → ödeme simülasyonu.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, PackageSearch, Loader2, SlidersHorizontal } from 'lucide-react';
import * as customerService from '../../services/customerService';
import { apiErrorMessage } from '../../services/api';
import BoxCard from '../../components/customer/BoxCard';
import { BOX_CONTENTS as CONTENTS } from '../../data/boxContents';

const SORTS = [
  { key: 'onerilen', label: 'Önerilen' },
  { key: 'puan', label: 'Puana göre' },
  { key: 'fiyat', label: 'Fiyat (artan)' },
  { key: 'aciliyet', label: 'Son fırsatlar' },
];

export default function Discover() {
  const { authed, geo } = useOutletContext();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const search = (params.get('q') || '').toLowerCase();

  const [boxes, setBoxes] = useState([]);
  const [favIds, setFavIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cat, setCat] = useState('');        // seçili kategori anahtarı
  const [sort, setSort] = useState('onerilen');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Seçilen konum + yarıçap → sunucu coğrafi olarak yakındakileri mesafe sırasıyla döner
      const data = await customerService.listBoxes({ lng: geo.lng, lat: geo.lat, radiusKm: geo.radiusKm });
      setBoxes(data);
      if (authed) {
        try {
          const favs = await customerService.listFavorites();
          setFavIds(new Set(favs.map((f) => f._id || f.id)));
        } catch { /* favori çekilemezse kartlar yine görünür */ }
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Kutular yüklenemedi.'));
    } finally {
      setLoading(false);
    }
  }, [authed, geo.lng, geo.lat, geo.radiusKm]);

  useEffect(() => { load(); }, [load]);

  const toggleFavorite = async (businessId) => {
    if (!authed) { navigate('/kesfet/giris?redirect=/kesfet'); return; }
    if (!businessId) return;
    const next = new Set(favIds);
    const isFav = next.has(businessId);
    isFav ? next.delete(businessId) : next.add(businessId); // iyimser
    setFavIds(next);
    try {
      isFav ? await customerService.removeFavorite(businessId) : await customerService.addFavorite(businessId);
    } catch {
      load();
    }
  };

  // Kategori + arama süzgeci (konum/mesafe sunucuda uygulanır), ardından sıralama
  const filtered = useMemo(() => {
    const list = boxes.filter((b) => {
      const okCat = !cat || (b.contents || []).includes(cat);
      const name = (b.business?.name || b.businessName || '').toLowerCase();
      const okSearch = !search || name.includes(search);
      return okCat && okSearch;
    });
    const sorted = [...list];
    if (sort === 'puan') sorted.sort((a, b) => (b.business?.rating ?? -1) - (a.business?.rating ?? -1));
    else if (sort === 'fiyat') sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (sort === 'aciliyet') sorted.sort((a, b) => (a.remaining ?? Infinity) - (b.remaining ?? Infinity));
    return sorted;
  }, [boxes, cat, search, sort]);

  const availableCats = useMemo(() => {
    const present = new Set();
    boxes.forEach((b) => (b.contents || []).forEach((k) => present.add(k)));
    return CONTENTS.filter((c) => present.has(c.key));
  }, [boxes]);

  return (
    <div>
      {/* Başlık */}
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
          <Leaf className="h-6 w-6 text-emerald-600" /> Sizin için seçilenler
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {search ? <>"{search}" için sonuçlar</> : 'Bugün kurtarılmayı bekleyen sürpriz kutular'}
        </p>
      </div>

      {/* Mobil filtre çubuğu (kategoriler + sıralama) */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <div className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 pb-1">
          <FilterChip active={cat === ''} onClick={() => setCat('')}>Tümü</FilterChip>
          {availableCats.map((c) => (
            <FilterChip key={c.key} active={cat === c.key} onClick={() => setCat(cat === c.key ? '' : c.key)}>
              {c.emoji} {c.short}
            </FilterChip>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-8">
        {/* Sol panel — masaüstü */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <SlidersHorizontal className="h-4 w-4 text-emerald-600" /> Filtrele
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Sıralama</p>
              <div className="space-y-1">
                {SORTS.map((s) => (
                  <label key={s.key} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50">
                    <input
                      type="radio" name="sort" checked={sort === s.key} onChange={() => setSort(s.key)}
                      className="h-3.5 w-3.5 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={sort === s.key ? 'font-semibold text-gray-900' : ''}>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {availableCats.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Kategoriler</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip active={cat === ''} onClick={() => setCat('')}>Tümü</FilterChip>
                  {availableCats.map((c) => (
                    <FilterChip key={c.key} active={cat === c.key} onClick={() => setCat(cat === c.key ? '' : c.key)}>
                      {c.emoji} {c.short}
                    </FilterChip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* İçerik */}
        <div>
          {!loading && !error && (
            <p className="mb-3 text-sm font-semibold text-gray-500">{filtered.length} kutu bulundu</p>
          )}

          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <PackageSearch className="h-12 w-12 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">Bu kritere uygun kutu yok</p>
              <p className="max-w-sm text-xs text-gray-400">Filtreyi değiştir ya da yarın tekrar bak — işletmeler her gün yeni kutu yayınlıyor.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((box, i) => (
                <BoxCard
                  key={box._id}
                  box={box}
                  index={i}
                  isFavorite={favIds.has(box.business?._id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 active:scale-95 ${
        active ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25' : 'bg-white text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}
