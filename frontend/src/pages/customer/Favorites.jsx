// Favoriler — kullanıcının favori işletmeleri. Girişsizse login'e yönlendirir.
import React, { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Loader2, MapPin, Store, X } from 'lucide-react';
import * as customerService from '../../services/customerService';
import { apiErrorMessage } from '../../services/api';
import { typeLabel } from '../../components/admin/AdminUI';

export default function Favorites() {
  const { authed } = useOutletContext();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFavorites(await customerService.listFavorites());
    } catch (err) {
      setError(apiErrorMessage(err, 'Favoriler yüklenemedi.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authed) { navigate('/kesfet/giris?redirect=/kesfet/favoriler'); return; }
    load();
  }, [authed, load, navigate]);

  const remove = async (id) => {
    const prev = favorites;
    setFavorites((f) => f.filter((b) => (b._id || b.id) !== id)); // iyimser
    try {
      await customerService.removeFavorite(id);
    } catch (err) {
      setFavorites(prev);
      setError(apiErrorMessage(err));
    }
  };

  if (!authed) return null;

  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
        <Heart className="h-6 w-6 text-rose-500" /> Favorilerim
      </h1>
      <p className="mt-1 text-sm text-gray-500">Beğendiğin işletmeler yeni kutu yayınlayınca haberin olur.</p>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">{error}</div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <Heart className="h-12 w-12 text-gray-200" />
          <p className="text-sm font-semibold text-gray-700">Henüz favorin yok</p>
          <p className="text-xs text-gray-400">Keşfette bir işletmenin kalbine dokunarak favorine ekle.</p>
          <button onClick={() => navigate('/kesfet')} className="mt-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">Keşfete git</button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((b, i) => {
            const id = b._id || b.id;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i * 0.04, 0.3) } }}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-emerald-50">
                  {b.logoUrl ? <img src={b.logoUrl} alt="" className="h-full w-full object-cover" />
                    : <span className="flex h-full w-full items-center justify-center text-emerald-600"><Store className="h-5 w-5" /></span>}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">{b.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-400">
                    <MapPin className="h-3 w-3 shrink-0" /> {b.address || typeLabel(b.businessType)}
                  </p>
                </div>
                <button onClick={() => remove(id)} title="Favorilerden çıkar"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-300 transition hover:bg-rose-50 hover:text-rose-500">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
