// Ekip & Şubeler sekmesi — işletmeye kayıtlı çalışanların sayfa yetkileri
// buradan düzenlenir/silinir; zincir işletmelerin bağlı şubeleri listelenir.
import React, { useCallback, useEffect, useState } from 'react';
import { Users, Store, Trash2, Loader2, GitBranch } from 'lucide-react';
import * as adminService from '../../../services/adminService';
import { apiErrorMessage } from '../../../services/api';
import {
  LightCard, StatusBadge, Spinner, EmptyState, SuccessButton, DangerButton, formatDate,
} from '../../../components/admin/AdminUI';
import { SectionTitle } from './shared';

// İşletme paneli menüsündeki sayfalar (BusinessLayout NAV ile birebir;
// 'ekip' hariç — o yalnızca ana hesaba açıktır)
const PAGE_OPTIONS = [
  { key: 'genel-bakis', label: 'Genel Bakış' },
  { key: 'siparisler', label: 'Siparişler' },
  { key: 'kutu', label: 'Kutu & Teslimat' },
  { key: 'finans', label: 'Finans' },
  { key: 'vitrin', label: 'Vitrin' },
  { key: 'profil', label: 'Profil' },
  { key: 'ayarlar', label: 'Ayarlar' },
];

export default function TeamTab({ businessId, push }) {
  const [data, setData] = useState(null); // {employees, branches}
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState({});  // employeeId → allowedPages taslağı
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminService.listBusinessEmployees(businessId);
      setData(d);
      setPages(Object.fromEntries(d.employees.map((e) => [e._id, e.allowedPages || []])));
    } catch (err) {
      push(apiErrorMessage(err, 'Ekip yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [businessId, push]);

  useEffect(() => { load(); }, [load]);

  const togglePage = (empId, key) => {
    setPages((p) => {
      const cur = p[empId] || [];
      return { ...p, [empId]: cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key] };
    });
  };

  const savePages = async (emp) => {
    setBusyId(emp._id);
    try {
      const res = await adminService.updateEmployee(emp._id, { allowedPages: pages[emp._id] || [] });
      push(res.message || 'Yetkiler güncellendi.');
      await load();
    } catch (err) {
      push(apiErrorMessage(err), 'error');
    } finally {
      setBusyId('');
    }
  };

  const remove = async (emp) => {
    if (!window.confirm(`${emp.name} adlı çalışan silinsin mi? Bu işlem geri alınamaz.`)) return;
    setBusyId(emp._id);
    try {
      const res = await adminService.deleteEmployee(emp._id);
      push(res.message);
      await load();
    } catch (err) {
      push(apiErrorMessage(err), 'error');
    } finally {
      setBusyId('');
    }
  };

  if (loading || !data) {
    return <LightCard><div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div></LightCard>;
  }

  const dirty = (emp) => (pages[emp._id] || []).join(',') !== (emp.allowedPages || []).join(',');

  return (
    <div className="space-y-5">
      {/* Çalışanlar */}
      <LightCard className="p-6">
        <SectionTitle icon={Users}>Çalışanlar ({data.employees.length})</SectionTitle>
        {data.employees.length === 0 ? (
          <EmptyState light icon={Users} title="Kayıtlı çalışan yok"
            hint="İşletme, panelinin Ekip Yönetimi sayfasından çalışan ekleyebilir." />
        ) : (
          <div className="space-y-4">
            {data.employees.map((emp) => (
              <div key={emp._id} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white">
                      {emp.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{emp.name}</p>
                      <p className="truncate text-xs text-gray-400">
                        {emp.email} <span className="mx-1 text-gray-300">·</span> kayıt {formatDate(emp.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SuccessButton onClick={() => savePages(emp)} disabled={busyId === emp._id || !dirty(emp)} className="px-3 py-1.5">
                      {busyId === emp._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Yetkileri Kaydet'}
                    </SuccessButton>
                    <DangerButton onClick={() => remove(emp)} disabled={busyId === emp._id} className="px-3 py-1.5">
                      <Trash2 className="h-3.5 w-3.5" /> Sil
                    </DangerButton>
                  </div>
                </div>

                {/* Sayfa yetkileri — çip seti */}
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Erişebildiği Sayfalar</p>
                <div className="flex flex-wrap gap-2">
                  {PAGE_OPTIONS.map((p) => {
                    const on = (pages[emp._id] || []).includes(p.key);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => togglePage(emp._id, p.key)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                          on
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                            : 'bg-white text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </LightCard>

      {/* Şubeler */}
      <LightCard className="p-6">
        <SectionTitle icon={GitBranch} tone="text-indigo-500">Bağlı Şubeler ({data.branches.length})</SectionTitle>
        {data.branches.length === 0 ? (
          <p className="text-sm text-gray-400">Bu işletmenin bağlı şubesi yok (tek şube olarak çalışıyor).</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.branches.map((br) => (
              <div key={br._id} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-400 ring-1 ring-inset ring-gray-200">
                  <Store className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {br.name}{br.branchName ? ` - ${br.branchName}` : ''}
                    </p>
                    <StatusBadge status={br.status} light />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-400">{br.address || '—'}</p>
                  <p className="text-xs text-gray-400">{br.phone || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </LightCard>
    </div>
  );
}
