// Keşfet — bugünün sürpriz kutuları, responsive grid.
// Masaüstünde 3-4 sütun, tablette 2, mobilde tek kolon. Kategori filtreleri +
// üst bardan gelen arama sorgusu (isim) istemci tarafında süzülür.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, PackageSearch, Loader2 } from 'lucide-react';
import * as customerService from '../../services/customerService';
import { apiErrorMessage } from '../../services/api';
import BoxCard from '../../components/customer/BoxCard';
import { BOX_CONTENTS as CONTENTS } from '../../data/boxContents';

export default function Discover() {
  const { authed } = useOutletContext();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const search = (params.get('q') || '').toLowerCase();

  const [boxes, setBoxes] = useState([]);
  const [favIds, setFavIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cat, setCat] = useState(''); // seçili kategori anahtarı

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await customerService.listBoxes();
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
  }, [authed]);

  useEffect(() => { load(); }, [load]);

  const toggleFavorite = async (businessId) => {
    if (!authed) { navigate('/kesfet/giris?redirect=/kesfet'); return; }
    if (!businessId) return;
    const next = new Set(favIds);
    const isFav = next.has(businessId);
    // İyimser güncelleme
    isFav ? next.delete(businessId) : next.add(businessId);
    setFavIds(next);
    try {
      isFav ? await customerService.removeFavorite(businessId) : await customerService.addFavorite(businessId);
    } catch {
      load(); // hata olursa gerçek durumu geri çek
    }
  };

  // Kategori + arama süzgeci (istemci tarafı — liste küçük)
  const filtered = useMemo(() => {
    return boxes.filter((b) => {
      const okCat = !cat || (b.contents || []).includes(cat);
      const name = (b.business?.name || b.businessName || '').toLowerCase();
      const okSearch = !search || name.includes(search);
      return okCat && okSearch;
    });
  }, [boxes, cat, search]);

  // Yalnızca listede geçen kategorileri filtre çubuğunda göster
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

      {/* Kategori filtreleri */}
      {availableCats.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterChip active={cat === ''} onClick={() => setCat('')}>Tümü</FilterChip>
          {availableCats.map((c) => (
            <FilterChip key={c.key} active={cat === c.key} onClick={() => setCat(cat === c.key ? '' : c.key)}>
              {c.emoji} {c.short}
            </FilterChip>
          ))}
        </div>
      )}

      {/* İçerik */}
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
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 active:scale-95 ${
        active ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25' : 'bg-white text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}
