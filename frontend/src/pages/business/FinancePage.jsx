import { useState, useEffect } from 'react';
import { 
  Banknote, 
  CalendarDays, 
  Landmark,
  CheckCircle2,
  Clock,
  XCircle,
  Pencil,
  Check
} from 'lucide-react';
import { getFinanceOverview, getPayouts, updateIban } from '../../services/businessService';
import { useToasts, ToastStack } from '../../components/admin/AdminUI';

export default function FinancePage() {
  const { toasts, push } = useToasts();
  const [overview, setOverview] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isEditingIban, setIsEditingIban] = useState(false);
  const [ibanForm, setIbanForm] = useState({ iban: 'TR', ibanOwner: '' });
  const [savingIban, setSavingIban] = useState(false);

  useEffect(() => {
    fetchData();
  }, [pagination.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewData, payoutsData] = await Promise.all([
        getFinanceOverview(),
        getPayouts(pagination.page)
      ]);
      setOverview(overviewData);
      setIbanForm({
        iban: overviewData.iban || 'TR',
        ibanOwner: overviewData.ibanOwner || ''
      });
      setPayouts(payoutsData.payouts || []);
      setPagination(payoutsData.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      push({ type: 'error', title: 'Hata', desc: 'Finans bilgileri yüklenemedi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleIbanSave = async (e) => {
    e.preventDefault();
    setSavingIban(true);
    try {
      const updated = await updateIban(ibanForm);
      setOverview((prev) => ({ ...prev, iban: updated.iban, ibanOwner: updated.ibanOwner }));
      setIsEditingIban(false);
      push({ type: 'success', title: 'Başarılı', desc: 'Banka bilgileri güncellendi.' });
    } catch (err) {
      push({ type: 'error', title: 'Hata', desc: 'Banka bilgileri güncellenirken bir hata oluştu.' });
    } finally {
      setSavingIban(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const renderStatus = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"><CheckCircle2 className="w-4 h-4" /> Ödendi</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"><Clock className="w-4 h-4" /> İşleniyor</span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700"><XCircle className="w-4 h-4" /> Başarısız</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"><Clock className="w-4 h-4" /> Bekliyor</span>;
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Finans ve Ödemeler</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bakiyenizi takip edin, banka hesap bilgilerinizi yönetin ve geçmiş ödemelerinizi görüntüleyin.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
              <Banknote className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bekleyen Bakiye</p>
              <p className="text-2xl font-bold text-gray-900">₺{overview?.pendingBalance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Sonraki Ödeme Tarihi</p>
              <p className="text-lg font-bold text-gray-900">
                {overview?.nextPayoutDate ? new Date(overview.nextPayoutDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '-'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Periyot: {overview?.payoutPeriod === 'weekly' ? 'Haftalık' : 'Günlük'}</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <Landmark className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Kazanç</p>
              <p className="text-2xl font-bold text-gray-900">₺{overview?.totalEarned?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* IBAN Form */}
        <div className="lg:col-span-1 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">Banka Bilgileri</h2>
            {!isEditingIban ? (
              <button onClick={() => setIsEditingIban(true)} className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors">
                <Pencil className="h-4 w-4" /> Düzenle
              </button>
            ) : (
              <button onClick={() => setIsEditingIban(false)} className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                İptal
              </button>
            )}
          </div>
          
          <div className="px-6 py-6">
            {!isEditingIban ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">IBAN</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{overview?.iban || <span className="text-gray-400 italic">Henüz girilmemiş</span>}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Alıcı Adı Soyadı</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{overview?.ibanOwner || <span className="text-gray-400 italic">Henüz girilmemiş</span>}</p>
                </div>
                {!overview?.iban && (
                  <div className="rounded-xl bg-orange-50 p-4 mt-4 border border-orange-100 text-sm text-orange-800 shadow-inner">
                    Ödemelerinizi alabilmek için lütfen geçerli bir banka hesabı ekleyin.
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleIbanSave} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                  <input
                    type="text"
                    required
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    value={ibanForm.iban}
                    onChange={(e) => {
                      let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      if (!val.startsWith('TR')) {
                        val = 'TR' + val.replace(/^T?R?/, '');
                      }
                      val = val.substring(0, 26);
                      const formatted = val.match(/.{1,4}/g)?.join(' ') || 'TR';
                      setIbanForm({ ...ibanForm, iban: formatted });
                    }}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-shadow font-mono"
                    maxLength={32}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alıcı Adı Soyadı</label>
                  <input
                    type="text"
                    required
                    value={ibanForm.ibanOwner}
                    onChange={(e) => setIbanForm({ ...ibanForm, ibanOwner: e.target.value })}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-shadow"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingIban}
                  className="mt-2 flex w-full justify-center items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-70 transition-colors"
                >
                  {savingIban ? 'Kaydediliyor...' : <><Check className="h-4 w-4" /> Kaydet</>}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Payouts Table */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">Hakediş Geçmişi</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme Tarihi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş Sayısı</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500 bg-gray-50/30">
                      Henüz geçmiş bir ödemeniz bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payout.payoutDate ? formatDate(payout.payoutDate) : formatDate(payout.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payout.totalOrders} Kutu
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ₺{payout.netAmount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {renderStatus(payout.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/30 px-6 py-3">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative ml-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Toplam <span className="font-medium text-gray-900">{pagination.total || 0}</span> kayıttan sayfa <span className="font-medium text-gray-900">{pagination.page}</span> / <span className="font-medium text-gray-900">{pagination.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center rounded-l-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Önceki</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
                    </button>
                    <button
                      onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center rounded-r-lg px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Sonraki</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
