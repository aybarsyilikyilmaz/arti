import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Building2, Store } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { apiErrorMessage } from '../../services/api';
import { useToasts, ToastStack, LightCard, Spinner } from '../../components/admin/AdminUI';
import DropZone, { IMAGE_TYPES } from '../../components/business/DropZone';
import { BOX_CONTENTS, MAX_CONTENTS } from '../../data/boxContents';
import PhonePreview from '../../components/business/PhonePreview';

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  phone: '',
  businessType: 'restoran',
  branchType: 'tek',
  legalName: '',
  taxOffice: '',
  taxNumber: '',
  mersisNumber: '',
  contactName: '',
  contactPhone: '',
  whatsappPhone: '',
  address: '',
  mapsUrl: '',
  dailyBoxCount: '1-2',
  boxContents: [],
  pickupStart: '',
  pickupEnd: '',
  description: '',
};

export default function AdminBusinessCreate() {
  const navigate = useNavigate();
  const { toasts, push } = useToasts();
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState(INITIAL_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  const handleToggleContent = (key) => {
    setForm(prev => {
      const exists = prev.boxContents.includes(key);
      if (exists) return { ...prev, boxContents: prev.boxContents.filter(x => x !== key) };
      if (prev.boxContents.length >= MAX_CONTENTS) {
        push(`En fazla ${MAX_CONTENTS} etiket seçebilirsiniz.`, 'warning');
        return prev;
      }
      return { ...prev, boxContents: [...prev.boxContents, key] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.branchName) delete payload.branchName;
      if (!payload.pickupStart) delete payload.pickupStart;
      if (!payload.pickupEnd) delete payload.pickupEnd;
      if (payload.boxContents.length === 0) delete payload.boxContents;

      const created = await adminService.createBusiness(payload);
      const businessId = created.business._id;

      if (logoFile || coverFile) {
        push('İşletme eklendi, fotoğraflar yükleniyor...', 'info');
        if (logoFile) await adminService.uploadBusinessImage(businessId, 'logo', logoFile);
        if (coverFile) await adminService.uploadBusinessImage(businessId, 'cover', coverFile);
      }

      push('İşletme başarıyla oluşturuldu ve onaylandı!', 'success');
      setTimeout(() => {
        navigate('/admin/panel/isletmeler');
      }, 1500);

    } catch (err) {
      push(apiErrorMessage(err, 'İşletme oluşturulamadı'), 'error');
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/panel/isletmeler')}
          className="rounded-full bg-white p-2 text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
          aria-label="Geri"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Yeni İşletme Ekle</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistem yöneticisi olarak işletmeyi doğrudan onaylı şekilde sisteme eklersiniz.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Sol Kısım: Form (Aşağı Doğru) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Temel Bilgiler */}
            <LightCard>
              <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
                <Building2 className="h-5 w-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Temel Bilgiler</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">İşletme Adı *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="Artı Fırın" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">İşletme Tipi *</label>
                    <select value={form.businessType} onChange={e => setForm({...form, businessType: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500">
                      <option value="restoran">Restoran</option>
                      <option value="firin">Fırın & Pastane</option>
                      <option value="kafe">Kafe</option>
                      <option value="market">Market</option>
                      <option value="manav">Manav</option>
                      <option value="kasap">Kasap</option>
                      <option value="otel">Otel</option>
                      <option value="diger">Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Şube Sayısı *</label>
                    <select value={form.branchType} onChange={e => setForm({...form, branchType: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500">
                      <option value="tek">Tek Şube</option>
                      <option value="zincir">Zincir / Çoklu Şube</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">İşletme Telefonu *</label>
                    <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="05XX XXX XX XX" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp (Opsiyonel)</label>
                    <input type="tel" value={form.whatsappPhone} onChange={e => setForm({...form, whatsappPhone: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="05XX XXX XX XX" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Açık Adres *</label>
                  <textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="h-20 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="Mahalle, Sokak, Kapı No, İlçe, İl..." />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Google Haritalar Linki</label>
                  <input type="url" value={form.mapsUrl} onChange={e => setForm({...form, mapsUrl: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="https://maps.app.goo.gl/..." />
                </div>
              </div>
            </LightCard>

            {/* Kurumsal Bilgiler */}
            <LightCard>
              <div className="mb-4 border-b border-gray-100 pb-4">
                <h2 className="font-semibold text-gray-900">Kurumsal & İletişim Bilgileri</h2>
                <p className="text-xs text-gray-500 mt-1">Fatura, vergi ve yetkili kişi bilgileri.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Resmi Şirket Unvanı</label>
                  <input value={form.legalName} onChange={e => setForm({...form, legalName: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="Örn: Artı Gıda A.Ş." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Vergi Dairesi</label>
                    <input value={form.taxOffice} onChange={e => setForm({...form, taxOffice: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="Örn: Şişli" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">VKN / TCKN</label>
                    <input value={form.taxNumber} onChange={e => setForm({...form, taxNumber: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="10 veya 11 haneli" maxLength={11} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Mersis Numarası (Opsiyonel)</label>
                  <input value={form.mersisNumber} onChange={e => setForm({...form, mersisNumber: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="16 haneli" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Yetkili Adı Soyadı</label>
                    <input value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="Ahmet Yılmaz" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Yetkili Telefonu</label>
                    <input value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="05XX XXX XX XX" />
                  </div>
                </div>
              </div>
            </LightCard>

            {/* Kutu ve Vitrin */}
            <LightCard>
              <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
                <Store className="h-5 w-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Kutu ve Vitrin</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Logo</label>
                    <DropZone
                      file={logoFile}
                      preview={logoPreview}
                      onDrop={(f, err) => {
                        if (err) return push(err, 'error');
                        setLogoFile(f);
                        setLogoPreview(URL.createObjectURL(f));
                      }}
                      label="Logo Yükle"
                      className="h-32"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Kapak Fotoğrafı</label>
                    <DropZone
                      file={coverFile}
                      preview={coverPreview}
                      onDrop={(f, err) => {
                        if (err) return push(err, 'error');
                        setCoverFile(f);
                        setCoverPreview(URL.createObjectURL(f));
                      }}
                      label="Kapak Yükle"
                      className="h-32"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Hakkımızda (Açıklama)</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="h-20 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="İşletmenin kısa tanıtımı..." />
                </div>
              </div>
            </LightCard>

            {/* Operasyon */}
            <LightCard>
              <div className="mb-4 border-b border-gray-100 pb-4">
                <h2 className="font-semibold text-gray-900">Operasyon (Opsiyonel)</h2>
                <p className="text-xs text-gray-500 mt-1">Sürpriz Kutu varsayılan ayarları.</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Teslim Başlangıç</label>
                    <input type="time" value={form.pickupStart} onChange={e => setForm({...form, pickupStart: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Teslim Bitiş</label>
                    <input type="time" value={form.pickupEnd} onChange={e => setForm({...form, pickupEnd: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Kutu İçerik Etiketleri (En fazla {MAX_CONTENTS})</label>
                  <div className="flex flex-wrap gap-2">
                    {BOX_CONTENTS.map((c) => {
                      const active = form.boxContents.includes(c.key);
                      return (
                        <button
                          type="button"
                          key={c.key}
                          onClick={() => handleToggleContent(c.key)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          } border`}
                        >
                          {c.emoji} {c.short}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </LightCard>

            {/* Hesap ve Giriş */}
            <LightCard>
              <div className="mb-4 border-b border-gray-100 pb-4">
                <h2 className="font-semibold text-gray-900">Hesap ve Giriş</h2>
                <p className="text-xs text-gray-500 mt-1">İşletmenin sisteme girmesi için e-posta ve şifresi.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">E-posta *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="ornek@isletme.com" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Şifre *</label>
                  <input required type="text" minLength="8" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500" placeholder="En az 8 karakter" />
                </div>
              </div>
            </LightCard>

          </div>

          {/* Sağ Kısım: Canlı Önizleme */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-6">
              <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-400">
                Canlı Önizleme
              </h3>
              <PhonePreview
                view="detay"
                name={form.name}
                logoUrl={logoPreview}
                coverUrl={coverPreview}
                description={form.description}
                contents={form.boxContents}
                pickupStart={form.pickupStart}
                pickupEnd={form.pickupEnd}
                addressLine={form.address}
                businessType={form.businessType}
              />
            </div>
          </div>
          
        </div>

        {/* Footer actions */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-end border-t border-gray-200 bg-white px-8 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:left-64 lg:left-72">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Spinner className="h-5 w-5" /> : <Save className="h-5 w-5" />}
            {saving ? 'Oluşturuluyor...' : 'İşletmeyi Oluştur'}
          </button>
        </div>
      </form>

      <ToastStack toasts={toasts} />
    </div>
  );
}
