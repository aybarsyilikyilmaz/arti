// Kullanıcı (Müşteri) Yönetimi — arama, sicil (sipariş/tasarruf/iade geçmişi)
// ve moderasyon (banlama). Satıra tıklayınca sağdan sicil paneli açılır.
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, ChevronLeft, ChevronRight, RefreshCw, X,
  ShieldBan, ShieldCheck, Wallet, Leaf, Undo2, ShoppingBag,
} from 'lucide-react';
import * as adminService from '../../services/adminService';
import { apiErrorMessage } from '../../services/api';
import {
  LightCard, StatusBadge, Spinner, EmptyState, GhostButton, SuccessButton, DangerButton,
  useToasts, ToastStack, formatDate, formatDateTime,
} from '../../components/admin/AdminUI';

const tl = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });

const searchCls = `w-72 rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3.5 text-sm text-gray-900
  placeholder-gray-400 shadow-sm outline-none transition-all duration-300 ease-in-out
  focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10`;

function BanBadge({ banned }) {
  return banned ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/[0.08] px-2.5 py-1 text-[11px] font-semibold text-rose-600 ring-1 ring-inset ring-rose-500/20">
      <ShieldBan className="h-3 w-3" /> Engelli
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/[0.08] px-2.5 py-1 text-[11px] font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
      Aktif
    </span>
  );
}

export default function AdminUsers() {
  const { toasts, push } = useToasts();
  const [q, setQ] = useState('');
  const [appliedQ, setAppliedQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sicil paneli
  const [detail, setDetail] = useState(null);      // {user, record, recentOrders}
  const [detailBusy, setDetailBusy] = useState(false);
  const [banBusy, setBanBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (appliedQ) params.q = appliedQ;
      setData(await adminService.listUsers(params));
    } catch (err) {
      push(apiErrorMessage(err, 'Kullanıcılar yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [appliedQ, page, push]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (id) => {
    setDetailBusy(true);
    try {
      setDetail(await adminService.getUserDetail(id));
    } catch (err) {
      push(apiErrorMessage(err, 'Sicil alınamadı.'), 'error');
    } finally {
      setDetailBusy(false);
    }
  };

  const toggleBan = async () => {
    const banned = Boolean(detail.user.bannedAt);
    if (!banned && !window.confirm(`${detail.user.name} platformdan engellensin mi? Mevcut oturumu da düşürülür.`)) return;
    setBanBusy(true);
    try {
      const res = banned
        ? await adminService.unbanUser(detail.user._id)
        : await adminService.banUser(detail.user._id);
      push(res.message);
      setDetail((d) => ({ ...d, user: { ...d.user, bannedAt: res.data.user.bannedAt } }));
      await load();
    } catch (err) {
      push(apiErrorMessage(err), 'error');
    } finally {
      setBanBusy(false);
    }
  };

  const users = data?.users || [];

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Kullanıcılar</h1>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{data?.totalUsers ?? 0}</span> müşteri · satıra tıklayıp sicili incele
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); setAppliedQ(q); }} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="İsim, e-posta ya da telefon…" className={searchCls} />
          </form>
          <GhostButton onClick={load} className="p-2.5" title="Yenile">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </GhostButton>
        </div>
      </div>

      <LightCard className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div>
        ) : users.length === 0 ? (
          <EmptyState light icon={Users} title="Kullanıcı bulunamadı"
            hint="Aramayı değiştir ya da temizle — kayıt olan her müşteri burada listelenir." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  <th className="px-5 py-3.5">Müşteri</th>
                  <th className="px-5 py-3.5">Telefon</th>
                  <th className="px-5 py-3.5">Kayıt</th>
                  <th className="px-5 py-3.5">Durum</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} onClick={() => openDetail(u._id)}
                    className="cursor-pointer border-b border-gray-50 transition-colors duration-200 hover:bg-gray-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{u.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3.5"><BanBadge banned={Boolean(u.bannedAt)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5">
            <p className="text-xs text-gray-400">sayfa {data.page}/{data.totalPages}</p>
            <div className="flex gap-2">
              <GhostButton onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="p-2">
                <ChevronLeft className="h-4 w-4" />
              </GhostButton>
              <GhostButton onClick={() => setPage((p) => p + 1)} disabled={page >= data.totalPages} className="p-2">
                <ChevronRight className="h-4 w-4" />
              </GhostButton>
            </div>
          </div>
        )}
      </LightCard>

      {/* Sicil paneli — sağdan süzülür */}
      <AnimatePresence>
        {(detail || detailBusy) && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDetail(null)}
              className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-gray-200 bg-white p-6 shadow-2xl"
            >
              {detailBusy || !detail ? (
                <div className="flex h-full items-center justify-center"><Spinner className="h-7 w-7" /></div>
              ) : (
                <>
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-gray-900">{detail.user.name}</h2>
                      <p className="mt-0.5 text-sm text-gray-400">{detail.user.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <BanBadge banned={Boolean(detail.user.bannedAt)} />
                        <span className="text-xs text-gray-400">üyelik {formatDate(detail.user.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDetail(null)}
                      className="rounded-lg p-2 text-gray-400 transition-all duration-300 hover:bg-gray-100 hover:text-gray-700 active:scale-95"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Sicil özeti */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                        <ShoppingBag className="h-3.5 w-3.5" /> Sipariş
                      </p>
                      <p className="mt-1 text-xl font-black text-gray-900">{detail.record.totalOrders}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                        <Wallet className="h-3.5 w-3.5" /> Harcama
                      </p>
                      <p className="mt-1 text-xl font-black text-gray-900">{tl.format(detail.record.totalSpent)}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3.5">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
                        <Leaf className="h-3.5 w-3.5" /> Tasarruf
                      </p>
                      <p className="mt-1 text-xl font-black text-emerald-700">{tl.format(detail.record.totalSaved)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                        <Undo2 className="h-3.5 w-3.5" /> İade / Süresi Dolan
                      </p>
                      <p className="mt-1 text-xl font-black text-gray-900">
                        {detail.record.refundCount} <span className="text-sm font-semibold text-gray-400">/ {detail.record.expiredCount}</span>
                      </p>
                    </div>
                  </div>

                  {/* Son siparişler */}
                  <h3 className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Son Siparişler</h3>
                  {detail.recentOrders.length === 0 ? (
                    <p className="text-sm text-gray-400">Henüz sipariş yok.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.recentOrders.map((o) => (
                        <div key={o._id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3.5 py-2.5">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {o.business ? `${o.business.name}${o.business.branchName ? ` - ${o.business.branchName}` : ''}` : '—'}
                            </p>
                            <p className="text-[11px] text-gray-400">{formatDateTime(o.createdAt)}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{o.amount} ₺</span>
                            <StatusBadge status={o.status} light />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Moderasyon */}
                  <div className="mt-8">
                    {detail.user.bannedAt ? (
                      <SuccessButton onClick={toggleBan} disabled={banBusy} className="w-full py-3">
                        <ShieldCheck className="h-4 w-4" /> Engeli Kaldır
                      </SuccessButton>
                    ) : (
                      <DangerButton onClick={toggleBan} disabled={banBusy} className="w-full py-3">
                        <ShieldBan className="h-4 w-4" /> Kullanıcıyı Engelle
                      </DangerButton>
                    )}
                    <p className="mt-2 text-center text-[11px] text-gray-400">
                      Engellenen kullanıcı giriş yapamaz; aktif oturumu düşürülür.
                    </p>
                  </div>
                </>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
