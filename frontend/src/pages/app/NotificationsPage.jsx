// Bildirimler: favori işletmelerin kutu yayınları. Sayfa açılınca okundu sayılır.
import React, { useEffect, useState } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, Sparkles } from 'lucide-react';
import * as userService from '../../services/userService';
import { GlassCard, Spinner, EmptyState, formatDateTime } from '../../components/admin/AdminUI';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { authed, restoring, refreshBadge } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      try {
        const res = await userService.listNotifications();
        setItems(res.data.notifications);
        if (res.unreadCount > 0) {
          await userService.markNotificationsRead();
          refreshBadge();
        }
      } catch { /* liste boş kalır */ }
      finally { setLoading(false); }
    })();
  }, [authed, refreshBadge]);

  if (!restoring && !authed) return <Navigate to="/app/giris" replace />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">Bildirimler</h1>
        <p className="mt-0.5 text-xs text-slate-500">Favori işletmelerinden taze haberler</p>
      </div>

      {loading ? (
        <GlassCard><div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div></GlassCard>
      ) : items.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={Bell}
            title="Bildirim yok"
            hint="Favorilediğin işletmeler kutu yayınladığında burada görürsün."
          />
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {items.map((n, i) => (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
            >
              <GlassCard
                interactive
                className={`flex cursor-pointer items-start gap-3.5 p-4 ${!n.readAt ? 'border-emerald-400/20' : ''}`}
                onClick={() => navigate('/app')}
              >
                <div className="relative mt-0.5 shrink-0">
                  {!n.readAt && <div className="absolute inset-0 rounded-xl bg-emerald-500/30 blur-md" />}
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-slate-800/60">
                    <Sparkles className="h-4.5 w-4.5 h-[18px] w-[18px] text-emerald-300" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug text-white">{n.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{n.body}</p>
                  <p className="mt-1.5 text-[10px] text-slate-600">{formatDateTime(n.createdAt)}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
