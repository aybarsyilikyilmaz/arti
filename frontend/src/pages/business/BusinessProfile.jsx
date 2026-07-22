import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Building2, FileDigit, MapPin, User, Loader2, Info, MessageCircle } from 'lucide-react';
import * as businessService from '../../services/businessService';
import { apiErrorMessage } from '../../services/api';
import { LightCard, SuccessButton, Spinner, useToasts, ToastStack } from '../../components/admin/AdminUI';

const inputCls = `w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900
  placeholder-gray-400 outline-none transition-all duration-300 ease-in-out
  focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed`;

export default function BusinessProfile() {
  const { me, reloadMe } = useOutletContext();
  const { toasts, push } = useToasts();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!me) return;
    const src = me.pendingUpdates ? { ...me, ...me.pendingUpdates } : me;
    setForm({
      name: src.name || '',
      businessType: src.businessType || '',
      branchType: src.branchType || '',
      legalName: src.legalName || '',
      taxOffice: src.taxOffice || '',
      taxNumber: src.taxNumber || '',
      mapsUrl: src.mapsUrl || '',
      address: src.address || '',
      contactName: src.contactName || '',
      contactRole: src.contactRole || '',
      branchName: src.branchName || '',
      phone: src.phone || '',
      email: src.email || '',
      whatsappPhone: src.whatsappPhone || '',
      contactPhone: src.contactPhone || '',
    });
  }, [me]);

  if (!form) {
    return <LightCard><div className="flex justify-center py-24"><Spinner className="h-7 w-7" /></div></LightCard>;
  }

  const isPending = !!me?.pendingUpdates;

  const submit = async (e) => {
    e.preventDefault();
    if (isPending) return;
    setSaving(true);
    try {
      await businessService.updateProfileRequest(form);
      push('Değişiklikleriniz alındı. Admin onayından geçtikten sonra yeniden yayına alınacaksınız.');
      reloadMe();
    } catch (err) {
      push(apiErrorMessage(err, 'Talep iletilemedi.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profilim</h1>
        <p className="mt-1 text-sm text-gray-500">İşletme bilgileriniz, adresiniz ve yetkili iletişim bilgileri.</p>
      </div>

      {!isPending && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <div>
            <p className="mt-0.5">Buradaki herhangi bir değişiklik yönetici onayına gitmektedir. Değişiklikleriniz onaylanana kadar uygulamada işletmeniz yeni bilgilerle görünmez.</p>
          </div>
        </div>
      )}

      {isPending && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold">Profil güncelleme talebiniz yönetici onayındadır.</p>
            <p className="mt-1 opacity-80">Yeni değişiklikler yönetici tarafından onaylanana veya reddedilene kadar profiliniz salt-okunur durumdadır.</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-2">
        {/* Firma Bilgileri */}
        <LightCard className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-gray-900">
            <Building2 className="h-4 w-4 text-indigo-500" /> Firma Bilgileri
          </h2>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">İşletme Adı (Marka)</span>
              <input value={form.name} disabled={isPending}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls} placeholder="Örn: Simit Sarayı Moda" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">İşletme Tipi</span>
                <select value={form.businessType} disabled={isPending}
                  onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                  className={inputCls}>
                  <option value="">Seçiniz</option>
                  <option value="restoran">Restoran</option>
                  <option value="firin">Fırın & Pastane</option>
                  <option value="market">Market & Bakkal</option>
                  <option value="kafe">Kafe & Tatlıcı</option>
                  <option value="manav">Manav</option>
                  <option value="kasap">Kasap & Şarküteri</option>
                  <option value="otel">Otel</option>
                  <option value="diger">Diğer</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Şube Tipi</span>
                <select value={form.branchType} disabled={isPending}
                  onChange={(e) => setForm({ ...form, branchType: e.target.value })}
                  className={inputCls}>
                  <option value="tek">Tek Şube</option>
                  <option value="zincir">Zincir Şube</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Resmi Şirket Unvanı</span>
              <input value={form.legalName} disabled={isPending}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                className={inputCls} placeholder="Simit Gıda A.Ş." />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Vergi Dairesi</span>
                <input value={form.taxOffice} disabled={isPending}
                  onChange={(e) => setForm({ ...form, taxOffice: e.target.value })}
                  className={inputCls} placeholder="Kadıköy VD" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Vergi Numarası / TCKN</span>
                <input value={form.taxNumber} disabled={isPending}
                  onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                  className={inputCls} placeholder="Güvenlik gereği gizlenmiştir" />
              </label>
            </div>
          </div>
        </LightCard>

        {/* Adres Bilgileri */}
        <LightCard className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-gray-900">
            <MapPin className="h-4 w-4 text-emerald-500" /> Adres Bilgileri
          </h2>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Google Maps Konum Linki</span>
              <input value={form.mapsUrl} disabled={isPending}
                onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
                className={inputCls} placeholder="https://maps.app.goo.gl/..." />
              <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Bu link, müşterinin gördüğü <strong>“Yol Tarifi Al”</strong> butonunu çalıştırır.
                  Yanlış ya da boş olursa müşteri seni haritada bulamaz veya <strong>yanlış adrese yönlendirilir</strong> —
                  siparişini teslim alamaz. Lütfen işletmenin <strong>tam</strong> Google Maps konumunu yapıştır:
                  Google Maps’te işletmeni aç → <strong>Paylaş → Bağlantıyı kopyala</strong>.
                </p>
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Tam Adres</span>
              <textarea value={form.address} disabled={isPending} rows={4}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={`${inputCls} resize-none`} placeholder="Sokak, kapı no vb." />
            </label>
          </div>
        </LightCard>

        {/* Yetkili Bilgileri */}
        <LightCard className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-gray-900">
            <User className="h-4 w-4 text-rose-500" /> Yetkili Bilgileri
          </h2>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Giriş E-Postası (Değiştirilemez)</span>
              <input value={form.email} disabled className={inputCls} />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Yetkili Adı</span>
                <input value={form.contactName} disabled={isPending}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className={inputCls} placeholder="Ahmet Yılmaz" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Görevi</span>
                <select value={form.contactRole} disabled={isPending}
                  onChange={(e) => setForm({ ...form, contactRole: e.target.value })}
                  className={inputCls}>
                  <option value="sahibi">İşletme Sahibi</option>
                  <option value="mudur">Şube Müdürü</option>
                  <option value="operasyon">Operasyon Sorumlusu</option>
                  <option value="diger">Diğer</option>
                </select>
              </label>
            </div>
          </div>
        </LightCard>

        {/* İletişim Bilgileri */}
        <LightCard className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-gray-900">
            <MessageCircle className="h-4 w-4 text-emerald-500" /> İletişim Bilgileri
          </h2>
          <p className="mb-5 text-xs text-gray-400">Sistem bildirimleri ve müşteri iletişimi için kullanılacak numaralar.</p>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">İşletme Telefonu</span>
              <input value={form.phone} disabled={isPending}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputCls} placeholder="05XX XXX XX XX" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">WhatsApp (Bot)</span>
              <input value={form.whatsappPhone} disabled={isPending}
                onChange={(e) => setForm({ ...form, whatsappPhone: e.target.value })}
                className={inputCls} placeholder="05XX XXX XX XX" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Sabit Telefon</span>
              <input value={form.contactPhone} disabled={isPending}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className={inputCls} placeholder="0212 XXX XX XX" />
            </label>
          </div>
        </LightCard>

        <div className="xl:col-span-2">
          <SuccessButton type="submit" disabled={saving || isPending} className="w-full py-3.5 text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Değişiklikleri Yönetici Onayına Gönder'}
          </SuccessButton>
        </div>
      </form>
    </div>
  );
}
