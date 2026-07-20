// Finans & Hakedişler — platformun para akışı tek ekranda:
// brüt ciro (müşteri ödemesi) / platform farkı / işletme hakedişi / ödenen / bekleyen
// GELİR MODELİ: işletme basePrice belirler, biz commissionRate kadar üstüne ekleriz.
import React, { useCallback, useEffect, useState } from 'react';
import {
  Banknote, Landmark, RefreshCw, Percent, Wallet, Hourglass, CheckCircle2, Loader2,
} from 'lucide-react';
import * as adminService from '../../services/adminService';
import { apiErrorMessage } from '../../services/api';
import {
  LightCard, Spinner, EmptyState, GhostButton, SuccessButton,
  useToasts, ToastStack, formatDate,
} from '../../components/admin/AdminUI';
import { PayoutBadge } from './detail/FinanceTab';

const tl = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });
const PERIOD_LABELS = { daily: 'Günlük', weekly: 'Haftalık', monthly: 'Aylık' };

function SummaryCard({ icon: Icon, label, value, sub, tone = 'text-gray-900', iconBg = 'bg-gray-50 text-gray-400' }) {
  return (
    <LightCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
          <p className={`mt-1.5 text-2xl font-black ${tone}`}>{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <span className={`rounded-xl p-2.5 ${iconBg}`}><Icon className="h-5 w-5" /></span>
      </div>
    </LightCard>
  );
}

export default function AdminFinance() {
  const { toasts, push } = useToasts();
  const [data, setData] = useState(null); // {rows, totals, recentPayouts}
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await adminService.getPlatformFinance());
    } catch (err) {
      push(apiErrorMessage(err, 'Finans verisi yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => { load(); }, [load]);

  const pay = async (row) => {
    const reference = window.prompt(
      `${row.name} işletmesine ${tl.format(row.pending)} ödenecek.\nBanka dekont / havale referansı (isteğe bağlı):`
    );
    if (reference === null) return; // vazgeçti
    setBusyId(String(row.businessId));
    try {
      const res = await adminService.createPayout(row.businessId, reference.trim());
      push(res.message);
      await load();
    } catch (err) {
      push(apiErrorMessage(err), 'error');
    } finally {
      setBusyId('');
    }
  };

  if (loading || !data) {
    return <LightCard><div className="flex justify-center py-24"><Spinner className="h-8 w-8" /></div></LightCard>;
  }

  const { rows, totals, recentPayouts } = data;

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Finans & Hakedişler</h1>
          <p className="mt-1 text-sm text-gray-500">Teslim edilen siparişler üzerinden işletme hakedişleri ve platform farkı kazancı</p>
        </div>
        <GhostButton onClick={load} className="p-2.5" title="Yenile">
          <RefreshCw className="h-4 w-4" />
        </GhostButton>
      </div>

      {/* Platform özeti */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Wallet} label="Brüt Ciro (Müşteri Ödemesi)" value={tl.format(totals.gross)}
          iconBg="bg-gray-50 text-gray-400" />
        <SummaryCard icon={Percent} label="Platform Farkı (Artı+ Kazancı)" value={tl.format(totals.platformEarning ?? totals.commission)}
          sub={`İşletme hakedişi: ${tl.format(totals.net ?? 0)}`} tone="text-emerald-700" iconBg="bg-emerald-50 text-emerald-600" />
        <SummaryCard icon={CheckCircle2} label="Ödenen Hakediş" value={tl.format(totals.paid)}
          iconBg="bg-sky-50 text-sky-600" />
        <SummaryCard icon={Hourglass} label="Bekleyen Hakediş" value={tl.format(totals.pending)}
          sub={`${rows.filter((r) => r.pending > 0).length} işletme ödeme bekliyor`}
          tone={totals.pending > 0 ? 'text-amber-600' : 'text-gray-900'} iconBg="bg-amber-50 text-amber-600" />
      </div>

      {/* Hakediş tablosu */}
      <LightCard className="mt-5 overflow-hidden">
        <div className="flex items-center gap-2 px-4 pt-5">
          <Landmark className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-gray-900">İşletme Hakedişleri</h2>
        </div>
        {rows.length === 0 ? (
          <EmptyState light icon={Banknote} title="Henüz onaylı işletme yok"
            hint="İşletmeler satış yaptıkça hakedişleri burada birikir." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  <th className="px-4 py-3.5">İşletme</th>
                  <th className="px-4 py-3.5">IBAN</th>
                  <th className="px-4 py-3.5">Periyot</th>
                  <th className="px-4 py-3.5">Fark %</th>
                  <th className="px-4 py-3.5">Brüt Ciro</th>
                  <th className="px-4 py-3.5">Platform Farkı</th>
                  <th className="px-4 py-3.5">İşletme Hakedişi</th>
                  <th className="px-4 py-3.5">Ödenen</th>
                  <th className="px-4 py-3.5">Bekleyen</th>
                  <th className="px-4 py-3.5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.businessId} className="border-b border-gray-50 transition-colors duration-200 hover:bg-gray-50/60">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-900">{r.name}</p>
                      <p className="text-[11px] text-gray-400">{r.orders} teslim edilen sipariş</p>
                    </td>
                    <td className="px-4 py-3.5">
                      {r.iban ? (
                        <>
                          <p className="font-mono text-xs tracking-wider text-gray-600">{r.iban}</p>
                          <p className="text-[11px] text-gray-400">{r.ibanOwner || '—'}</p>
                        </>
                      ) : (
                        <span className="text-xs italic text-rose-400">IBAN tanımsız</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{PERIOD_LABELS[r.payoutPeriod] || r.payoutPeriod}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-700">%{r.commissionRate}</td>
                    <td className="px-4 py-3.5 text-gray-500">{tl.format(r.gross)}</td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-700">{tl.format(r.platformEarning ?? r.commission)}</td>
                    <td className="px-4 py-3.5 text-gray-600 font-medium">{tl.format(r.net)}</td>
                    <td className="px-4 py-3.5 text-gray-500">{tl.format(r.paid)}</td>
                    <td className={`px-4 py-3.5 font-bold ${r.pending > 0 ? 'text-amber-600' : 'text-gray-300'}`}>
                      {tl.format(r.pending)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {r.pending > 0 && (
                        <SuccessButton onClick={() => pay(r)} disabled={busyId === String(r.businessId)} className="px-3 py-1.5">
                          {busyId === String(r.businessId)
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <><Banknote className="h-3.5 w-3.5" /> Öde</>}
                        </SuccessButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </LightCard>

      {/* Son ödemeler */}
      <LightCard className="mt-5 overflow-hidden">
        <div className="flex items-center gap-2 px-4 pt-5">
          <Banknote className="h-4 w-4 text-emerald-500" />
          <h2 className="text-sm font-bold text-gray-900">Son Hakediş Ödemeleri</h2>
        </div>
        {recentPayouts.length === 0 ? (
          <p className="px-4 pb-6 pt-3 text-sm text-gray-400">Henüz ödeme kaydı yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  <th className="px-4 py-3">İşletme</th>
                  <th className="px-4 py-3">Dönem</th>
                  <th className="px-4 py-3">Tutar</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Dekont Ref.</th>
                  <th className="px-4 py-3">Ödeme Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {recentPayouts.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 transition-colors duration-200 hover:bg-gray-50/60">
                    <td className="px-4 py-3.5 font-semibold text-gray-900">
                      {p.business ? `${p.business.name}${p.business.branchName ? ` - ${p.business.branchName}` : ''}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">{formatDate(p.periodStart)} – {formatDate(p.periodEnd)}</td>
                    <td className="px-4 py-3.5 font-bold text-gray-900">{tl.format(p.netAmount)}</td>
                    <td className="px-4 py-3.5"><PayoutBadge status={p.status} /></td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{p.reference || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">{p.payoutDate ? formatDate(p.payoutDate) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </LightCard>
    </div>
  );
}
