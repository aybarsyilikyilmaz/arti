// Favoriler: favori işletmeler listesi — kutu yayınlayınca bildirim gelir.
import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, HeartOff } from 'lucide-react';
import * as userService from '../../services/userService';
import { apiErrorMessage } from '../../services/api';
import { GlassCard, Spinner, EmptyState, useToasts, ToastStack, typeLabel } from '../../components/admin/AdminUI';

export default function FavoritesPage() {
  const { authed, restoring } = useOutletContext();
  const { toasts, push } = useToasts();
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFavs(await userService.listFavorites());
    } catch (err) {
      push(apiErrorMessage(err, 'Favoriler yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  if (!restoring && !authed) return <Navigate to="/app/giris" replace />;

  const remove = async (b) => {
    setFavs((f) => f.filter((x) => x._id !== b._id)); // iyimser
    try {
      await userService.removeFavorite(b._id);
    } catch (err) {
      setFavs((f) => [...f, b]);
      push(apiErrorMessage(err), 'error');
    }
  };

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">Favorilerim</h1>
        <p className="mt-0.5 text-xs text-slate-500">Kutu yayınladıklarında anında haber veririz</p>
      </div>

      {loading ? (
        <GlassCard><div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div></GlassCard>
      ) : favs.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={Heart}
            title="Henüz favorin yok"
            hint="Keşfet'te beğendiğin işletmenin kalbine dokun — kutu açtıklarında ilk sen öğren."
          />
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {favs.map((b, i) => (
              <motion.div
                key={b._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                exit={{ opacity: 0, x: -32, transition: { duration: 0.25 } }}
              >
                <GlassCard interactive className="flex items-center gap-4 p-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-xl bg-rose-500/20 blur-md" />
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-rose-500/20 to-slate-800/60 text-sm font-bold text-rose-300">
                      {b.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{b.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                      {typeLabel(b.businessType)}{b.address ? ` · ${b.address}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(b)}
                    className="rounded-full p-2.5 text-slate-500 transition-all duration-300 ease-in-out hover:bg-rose-500/10 hover:text-rose-400 active:scale-90"
                    title="Favoriden çıkar"
                  >
                    <HeartOff className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                  </button>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
