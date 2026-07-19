// Finans & Hakediş sekmesi — bakiye özeti işletme paneliyle AYNI hesaptan
// (financeService) gelir; IBAN görüntülenir, hakediş durumları buradan yönetilir.
import React, { useCallback, useEffect, useState } from 'react';
import { Banknote, Landmark, CalendarClock, CheckCircle2, XCircle, Hourglass } from 'lucide-react';
import * as adminService from '../../../services/adminService';
import { apiErrorMessage } from '../../../services/api';
import { LightCard, Spinner, SuccessButton, GhostButton, EmptyState, formatDate } from '../../../components/admin/AdminUI';
import { SectionTitle } from './shared';

const PERIOD_LABELS = { daily: 'Günlük', weekly: 'Haftalık', monthly: 'Aylık' };

// Hakediş durumları sipariş durumlarından ayrı bir küme — kendi rozeti var
const PAYOUT_BADGES = {
  PENDING:    { label: 'Bekliyor',   cls: 'bg-amber-500/[0.08] text-amber-600 ring-amber-500/20' },
  PROCESSING: { label: 'İşleniyor',  cls: 'bg-sky-500/[0.08] text-sky-600 ring-sky-500/20' },
  PAID:       { label: 'Ödendi',     cls: 'bg-emerald-500/[0.08] text-emerald-600 ring-emerald-500/20' },
  FAILED:     { label: 'Başarısız',  cls: 'bg-rose-500/[0.08] text-rose-600 ring-rose-500/20' },
};

export function PayoutBadge({ status }) {
  const s = PAYOUT_BADGES[status] || { label: status, cls: 'bg-gray-100 text-gray-500 ring-gray-200' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function FinanceTab({ businessId, push }) {
  const [data, setData] = useState(null); // {overview, payouts, pagination}
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await adminService.getBusinessFinance(businessId));
    } catch (err) {
      push(apiErrorMessage(err, 'Finans verisi yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [businessId, push]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (payout, status) => {
    const labels = { PAID: 'ÖDENDİ', PROCESSING: 'İŞLENİYOR', FAILED: 'BAŞARISIZ' };
    if (!window.confirm(`${payout.netAmount} ₺ tutarındaki hakediş "${labels[status]}" olarak işaretlensin mi?`)) return;
    setBusyId(payout.id);
    try {
      const res = await adminService.updatePayoutStatus(payout.id, status);
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

  const { overview, payouts } = data;

  return (
    <div className="space-y-5">
      {/* Özet kartları */}
      <div className="grid gap-4 sm:grid-cols-3">
        <LightCard className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Toplam Kazanç</p>
          <p className="mt-1.5 text-2xl font-black text-gray-900">{overview.totalEarned.toLocaleString('tr-TR')} ₺</p>
          <p className="mt-0.5 text-xs text-gray-400">Teslim edilen siparişlerden</p>
        </LightCard>
        <LightCard className="border-emerald-100 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">Bekleyen Bakiye</p>
          <p className="mt-1.5 text-2xl font-black text-emerald-700">{overview.pendingBalance.toLocaleString('tr-TR')} ₺</p>
          <p className="mt-0.5 text-xs text-gray-400">Ödenen: {overview.totalPaid.toLocaleString('tr-TR')} ₺</p>
        </LightCard>
        <LightCard className="p-5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            <CalendarClock className="h-3.5 w-3.5" /> Sonraki Ödeme
          </p>
          <p className="mt-1.5 text-2xl font-black text-gray-900">{formatDate(overview.nextPayoutDate)}</p>
          <p className="mt-0.5 text-xs text-gray-400">{PERIOD_LABELS[overview.payoutPeriod] || overview.payoutPeriod} periyot</p>
        </LightCard>
      </div>

      {/* IBAN */}
      <LightCard className="p-6">
        <SectionTitle icon={Landmark} tone="text-indigo-500">Banka Bilgileri</SectionTitle>
        {overview.iban ? (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">IBAN</p>
              <p className="mt-1 font-mono text-sm tracking-wider text-gray-900">{overview.iban}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Hesap Sahibi</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{overview.ibanOwner || '—'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">İşletme henüz IBAN tanımlamadı — hakediş ödemesi yapılamaz.</p>
        )}
      </LightCard>

      {/* Hakediş geçmişi */}
      <LightCard className="overflow-hidden">
        <div className="px-6 pt-5"><SectionTitle icon={Banknote}>Hakediş Ödemeleri</SectionTitle></div>
        {payouts.length === 0 ? (
          <EmptyState light icon={Hourglass} title="Henüz hakediş kaydı yok"
            hint="Ödeme dönemleri kapandıkça hakediş kayıtları burada listelenir." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  <th className="px-6 py-3">Dönem</th>
                  <th className="px-6 py-3">Sipariş</th>
                  <th className="px-6 py-3">Net Tutar</th>
                  <th className="px-6 py-3">Durum</th>
                  <th className="px-6 py-3">Ödeme Tarihi</th>
                  <th className="px-6 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 transition-colors duration-200 hover:bg-gray-50/60">
                    <td className="px-6 py-3.5 text-gray-500">{formatDate(p.periodStart)} – {formatDate(p.periodEnd)}</td>
                    <td className="px-6 py-3.5 text-gray-500">{p.totalOrders}</td>
                    <td className="px-6 py-3.5 font-bold text-gray-900">{p.netAmount.toLocaleString('tr-TR')} ₺</td>
                    <td className="px-6 py-3.5"><PayoutBadge status={p.status} /></td>
                    <td className="px-6 py-3.5 text-xs text-gray-400">{p.payoutDate ? formatDate(p.payoutDate) : '—'}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-2">
                        {(p.status === 'PENDING' || p.status === 'PROCESSING' || p.status === 'FAILED') && (
                          <SuccessButton onClick={() => setStatus(p, 'PAID')} disabled={busyId === p.id} className="px-3 py-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Ödendi İşaretle
                          </SuccessButton>
                        )}
                        {p.status === 'PENDING' && (
                          <GhostButton onClick={() => setStatus(p, 'PROCESSING')} disabled={busyId === p.id} className="px-3 py-1.5">
                            İşleme Al
                          </GhostButton>
                        )}
                        {p.status === 'PROCESSING' && (
                          <GhostButton onClick={() => setStatus(p, 'FAILED')} disabled={busyId === p.id}
                            className="px-3 py-1.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500">
                            <XCircle className="h-3.5 w-3.5" /> Başarısız
                          </GhostButton>
                        )}
                      </div>
                    </td>
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
