// Aktivite — işletmelerin yaptığı değişikliklerin logu (izleme; onay akışı DEĞİL).
// Profil/ayar, kutu şablonu, IBAN, vitrin görselleri değişiklikleri burada görünür.
// İşletmeye ve değişiklik türüne göre filtrelenebilir.
import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity, RefreshCw, Package, Banknote, UserCog, Image as ImageIcon, ChevronLeft, ChevronRight, Store,
} from 'lucide-react';
import * as adminService from '../../services/adminService';
import { apiErrorMessage } from '../../services/api';
import { LightCard, Spinner, EmptyState, GhostButton, formatDateTime } from '../../components/admin/AdminUI';

// approval:true olan türler admin onayına gider (izleme + onay); diğerleri direkt kaydolur.
const ACTIONS = {
  'profile.update': { label: 'Ayar', icon: UserCog, cls: 'bg-amber-50 text-amber-600' },
  'profile.request': { label: 'Profil', icon: UserCog, cls: 'bg-amber-50 text-amber-600', approval: true },
  'box.update': { label: 'Kutu', icon: Package, cls: 'bg-emerald-50 text-emerald-600' },
  'box.publish': { label: 'Kutu', icon: Package, cls: 'bg-emerald-50 text-emerald-600' },
  'iban.update': { label: 'IBAN', icon: Banknote, cls: 'bg-sky-50 text-sky-600' },
  'iban.request': { label: 'IBAN', icon: Banknote, cls: 'bg-sky-50 text-sky-600', approval: true },
  'images.update': { label: 'Vitrin', icon: ImageIcon, cls: 'bg-violet-50 text-violet-600' },
};
// Filtre değerleri önek — 'profile' hem .update hem .request'i yakalar.
const FILTERS = [
  { key: '', label: 'Tümü' },
  { key: 'profile', label: 'Profil/Ayar' },
  { key: 'box', label: 'Kutu' },
  { key: 'iban', label: 'IBAN' },
  { key: 'images', label: 'Vitrin' },
];

export default function AdminActivity() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [business, setBusiness] = useState('');
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    adminService.listBusinesses().then((r) => setBusinesses(r?.data?.businesses || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page };
      if (action) params.action = action;
      if (business) params.business = business;
      const data = await adminService.getActivity(params);
      setLogs(data.logs || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(apiErrorMessage(err, 'Aktivite kaydı yüklenemedi.'));
    } finally {
      setLoading(false);
    }
  }, [page, action, business]);

  useEffect(() => { load(); }, [load]);
  // Filtre değişince ilk sayfaya dön
  useEffect(() => { setPage(1); }, [action, business]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
            <Activity className="h-6 w-6 text-emerald-600" /> Aktivite
          </h1>
          <p className="mt-1 text-sm text-gray-500">İşletmelerin yaptığı değişiklikler (onaya gitmeyen düzenlemeler dahil)</p>
        </div>
        <GhostButton onClick={load} className="p-2.5" title="Yenile"><RefreshCw className="h-4 w-4" /></GhostButton>
      </div>

      {/* Filtreler */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setAction(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 active:scale-95 ${
                action === f.key ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25' : 'bg-white text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5">
          <Store className="h-4 w-4 text-gray-400" />
          <select value={business} onChange={(e) => setBusiness(e.target.value)} className="max-w-[12rem] bg-transparent text-sm text-gray-700 outline-none">
            <option value="">Tüm işletmeler</option>
            {businesses.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <LightCard className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-24"><Spinner className="h-8 w-8" /></div>
        ) : error ? (
          <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">{error}</div>
        ) : logs.length === 0 ? (
          <EmptyState light icon={Activity} title="Henüz aktivite yok" hint="İşletmeler değişiklik yaptıkça burada görünecek." />
        ) : (
          <ul className="divide-y divide-gray-50">
            {logs.map((l) => {
              const a = ACTIONS[l.action] || { label: 'Değişiklik', icon: Activity, cls: 'bg-gray-50 text-gray-500' };
              const Icon = a.icon;
              return (
                <li key={l._id} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50/60">
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${a.cls}`}><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm text-gray-800">
                      {l.message}
                      {a.approval && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Onay bekliyor</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      <span className="font-semibold text-gray-500">{l.businessName || 'İşletme'}</span>
                      {' · '}{l.actorName || 'İşletme Sahibi'}
                      {' · '}{formatDateTime(l.createdAt)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${a.cls}`}>{a.label}</span>
                </li>
              );
            })}
          </ul>
        )}

        {/* Sayfalama */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm text-gray-500">
            <span>Toplam <b className="text-gray-900">{pagination.total}</b> kayıt</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg p-1.5 ring-1 ring-inset ring-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft className="h-4 w-4" /></button>
              <span>{pagination.page} / {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg p-1.5 ring-1 ring-inset ring-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </LightCard>
    </div>
  );
}
