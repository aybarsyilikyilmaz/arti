// Profil & Ayarlar sekmesi — admin, işletme profilinin tamamını görür ve
// düzenler. Yalnızca DEĞİŞEN alanlar PATCH edilir; VKN salt-okunurdur
// (KVKK: şifreli saklanır, yalnızca bu ekranda çözülür).
import React, { useMemo, useState } from 'react';
import { Loader2, Building2, UserRound, Scale, MapPin, Package, RefreshCw, Check, X } from 'lucide-react';
import * as adminService from '../../../services/adminService';
import { apiErrorMessage } from '../../../services/api';
import { LightCard, SuccessButton, DangerButton, formatDate } from '../../../components/admin/AdminUI';
import { BOX_CONTENTS as CONTENTS, MAX_CONTENTS } from '../../../data/boxContents';
import { inputCls, Field, SectionTitle } from './shared';

const TYPE_OPTIONS = [
  ['restoran', 'Restoran'], ['firin', 'Fırın'], ['market', 'Market'], ['kafe', 'Kafe'],
  ['manav', 'Manav'], ['kasap', 'Kasap'], ['otel', 'Otel'], ['diger', 'Diğer'],
];
const ROLE_OPTIONS = [['sahibi', 'İşletme Sahibi'], ['mudur', 'Müdür'], ['operasyon', 'Operasyon'], ['diger', 'Diğer']];

// Bekleyen talep diff'inde ham anahtar yerine okunur etiket göster (IBAN dahil).
const PENDING_LABELS = {
  name: 'İşletme Adı', branchName: 'Şube Adı', businessType: 'İşletme Türü', branchType: 'Şube Türü',
  legalName: 'Yasal Unvan', taxOffice: 'Vergi Dairesi', taxNumber: 'Vergi No', mapsUrl: 'Maps Linki',
  address: 'Adres', contactName: 'İletişim Adı', contactRole: 'İletişim Rolü', email: 'E-posta',
  phone: 'Telefon', whatsappPhone: 'WhatsApp', contactPhone: 'İletişim Telefonu',
  iban: 'IBAN', ibanOwner: 'IBAN Alıcı Adı',
};

// PATCH'e girebilen alanlar (backend adminUpdateBusinessSchema ile birebir)
const TEXT_KEYS = ['name', 'branchName', 'businessType', 'legalName', 'taxOffice', 'mersisNumber',
  'address', 'mapsUrl', 'phone', 'contactName', 'contactRole', 'contactPhone', 'whatsappPhone',
  'description', 'pickupStart', 'pickupEnd'];
const NUM_KEYS = ['defaultPackageCount', 'defaultPrice', 'defaultOriginalPrice'];

export default function ProfileTab({ business, reload, push }) {
  const [saving, setSaving] = useState(false);
  const [updateBusy, setUpdateBusy] = useState(false);
  const [form, setForm] = useState(() => ({
    ...Object.fromEntries(TEXT_KEYS.map((k) => [k, business[k] || ''])),
    ...Object.fromEntries(NUM_KEYS.map((k) => [k, business[k] ?? ''])),
    boxContents: business.boxContents || [],
  }));

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleContent = (key) => {
    const on = form.boxContents.includes(key);
    if (!on && form.boxContents.length >= MAX_CONTENTS) {
      push(`En fazla ${MAX_CONTENTS} içerik seçilebilir.`, 'error');
      return;
    }
    setForm((f) => ({
      ...f,
      boxContents: on ? f.boxContents.filter((c) => c !== key) : [...f.boxContents, key],
    }));
  };

  // Yalnızca değişen alanlar gönderilir — dokunulmayan boş opsiyoneller
  // istemeden sıfırlanmaz
  const payload = useMemo(() => {
    const p = {};
    for (const k of TEXT_KEYS) {
      if ((form[k] || '') !== (business[k] || '')) p[k] = form[k];
    }
    for (const k of NUM_KEYS) {
      const cur = form[k] === '' ? null : Number(form[k]);
      const orig = business[k] ?? null;
      if (cur !== null && cur !== orig) p[k] = cur;
    }
    if ((form.boxContents || []).join(',') !== (business.boxContents || []).join(',')) {
      p.boxContents = form.boxContents;
    }
    return p;
  }, [form, business]);

  const dirty = Object.keys(payload).length > 0;

  const save = async () => {
    if (!dirty) { push('Değişiklik yok.', 'error'); return; }
    setSaving(true);
    try {
      const res = await adminService.updateBusinessProfile(business._id, payload);
      push(res.message || 'Profil güncellendi.');
      reload();
    } catch (err) {
      push(apiErrorMessage(err, 'Kaydedilemedi.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePendingUpdate = async (action) => {
    setUpdateBusy(true);
    try {
      if (action === 'approve') {
        const res = await adminService.approveProfileUpdate(business._id);
        push(res.message);
      } else {
        const reason = window.prompt('Reddetme sebebi (isteğe bağlı):') || 'Profil güncelleme talebiniz uygun bulunmadı.';
        const res = await adminService.rejectProfileUpdate(business._id, reason);
        push(res.message);
      }
      reload();
    } catch (err) {
      push(apiErrorMessage(err), 'error');
    } finally {
      setUpdateBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* İşletmenin beklettiği güncelleme talebi — eski → yeni diff */}
      {business.pendingUpdates && (
        <LightCard className="border-amber-200 bg-amber-50/60 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700">
            <RefreshCw className="h-4 w-4" /> İşletmenin Bekleyen Güncelleme Talebi
          </h3>
          <div className="mb-4 space-y-2">
            {Object.entries(business.pendingUpdates).map(([key, val]) => (
              <div key={key} className="flex flex-col gap-1 rounded-lg border border-amber-100 bg-white px-3 py-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">{PENDING_LABELS[key] || key}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-gray-400 line-through">{String(business[key] ?? '—')}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-semibold text-emerald-700">{String(val)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <SuccessButton onClick={() => handlePendingUpdate('approve')} disabled={updateBusy} className="flex-1 py-2">
              <Check className="h-4 w-4" /> Talebi Onayla
            </SuccessButton>
            <DangerButton onClick={() => handlePendingUpdate('reject')} disabled={updateBusy} className="flex-1 py-2">
              <X className="h-4 w-4" /> Reddet
            </DangerButton>
          </div>
        </LightCard>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {/* İşletme kimliği */}
        <LightCard className="p-6">
          <SectionTitle icon={Building2}>İşletme Bilgileri</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="İşletme Adı"><input value={form.name} onChange={set('name')} className={inputCls} /></Field>
            <Field label="Şube Adı"><input value={form.branchName} onChange={set('branchName')} className={inputCls} placeholder="—" /></Field>
            <Field label="İşletme Türü">
              <select value={form.businessType} onChange={set('businessType')} className={inputCls}>
                {TYPE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="İşletme Telefonu"><input value={form.phone} onChange={set('phone')} className={inputCls} /></Field>
            <Field label="Vitrin Açıklaması" className="sm:col-span-2">
              <textarea value={form.description} onChange={set('description')} rows={3} maxLength={500}
                className={`${inputCls} resize-none`} placeholder="Müşteri uygulamasındaki tanıtım metni" />
            </Field>
          </div>
        </LightCard>

        {/* Yetkili */}
        <LightCard className="p-6">
          <SectionTitle icon={UserRound} tone="text-indigo-500">Yetkili Kişi</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ad Soyad"><input value={form.contactName} onChange={set('contactName')} className={inputCls} /></Field>
            <Field label="Rol">
              <select value={form.contactRole} onChange={set('contactRole')} className={inputCls}>
                {ROLE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Yetkili Telefonu"><input value={form.contactPhone} onChange={set('contactPhone')} className={inputCls} /></Field>
            <Field label="WhatsApp (bot)"><input value={form.whatsappPhone} onChange={set('whatsappPhone')} className={inputCls} /></Field>
          </div>
          <p className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-gray-500">
            E-posta: <b className="text-gray-700">{business.email}</b> · KVKK açık rıza:{' '}
            <b className="text-gray-700">{business.kvkkConsentAt ? formatDate(business.kvkkConsentAt) : 'YOK'}</b>
          </p>
        </LightCard>

        {/* Yasal */}
        <LightCard className="p-6">
          <SectionTitle icon={Scale} tone="text-amber-500">Yasal Bilgiler</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ticari Unvan"><input value={form.legalName} onChange={set('legalName')} className={inputCls} /></Field>
            <Field label="Vergi Dairesi"><input value={form.taxOffice} onChange={set('taxOffice')} className={inputCls} /></Field>
            <Field label="VKN / TCKN (salt-okunur)">
              <input value={business.taxNumber || '—'} readOnly
                className={`${inputCls} cursor-default font-mono tracking-[0.15em] opacity-70`} />
            </Field>
            <Field label="MERSİS No"><input value={form.mersisNumber} onChange={set('mersisNumber')} className={inputCls} /></Field>
          </div>
        </LightCard>

        {/* Adres */}
        <LightCard className="p-6">
          <SectionTitle icon={MapPin} tone="text-rose-500">Adres & Konum</SectionTitle>
          <div className="grid gap-4">
            <Field label="Adres">
              <textarea value={form.address} onChange={set('address')} rows={2} className={`${inputCls} resize-none`} />
            </Field>
            <Field label="Harita Linki"><input value={form.mapsUrl} onChange={set('mapsUrl')} className={inputCls} placeholder="https://maps.google.com/…" /></Field>
          </div>
        </LightCard>
      </div>

      {/* Kutu varsayılanları */}
      <LightCard className="p-6">
        <SectionTitle icon={Package}>Kutu Varsayılanları & Teslim Saatleri</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <Field label="Paket Adedi">
            <input type="number" min="0" max="200" value={form.defaultPackageCount} onChange={set('defaultPackageCount')} className={`admin-no-spinner ${inputCls}`} />
          </Field>
          <Field label="İşletme Hakedişi (₺)">
            <input type="number" min="1" value={form.defaultPrice} onChange={set('defaultPrice')} className={`admin-no-spinner ${inputCls}`} />
          </Field>
          <Field label="Değeri (₺)">
            <input type="number" min="1" value={form.defaultOriginalPrice} onChange={set('defaultOriginalPrice')} className={`admin-no-spinner ${inputCls}`} />
          </Field>
          <Field label="Teslim Başlangıç"><input type="time" value={form.pickupStart} onChange={set('pickupStart')} className={inputCls} /></Field>
          <Field label="Teslim Bitiş"><input type="time" value={form.pickupEnd} onChange={set('pickupEnd')} className={inputCls} /></Field>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Kutu İçeriği</span>
            <span className={`text-[11px] font-semibold ${form.boxContents.length >= MAX_CONTENTS ? 'text-emerald-600' : 'text-gray-400'}`}>
              {form.boxContents.length}/{MAX_CONTENTS} seçildi
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CONTENTS.map((c) => {
              const on = form.boxContents.includes(c.key);
              const full = !on && form.boxContents.length >= MAX_CONTENTS;
              return (
                <button
                  type="button" key={c.key} onClick={() => toggleContent(c.key)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                    on
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                      : full
                        ? 'cursor-not-allowed bg-gray-50 text-gray-300'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                  }`}
                >
                  <span className={`text-sm ${full ? 'opacity-40 grayscale' : ''}`}>{c.emoji}</span>
                  {c.short}
                </button>
              );
            })}
          </div>
        </div>
      </LightCard>

      <SuccessButton onClick={save} disabled={saving || !dirty} className="w-full py-3.5 text-sm">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : dirty ? 'Değişiklikleri Kaydet' : 'Değişiklik Yok'}
      </SuccessButton>
    </div>
  );
}
