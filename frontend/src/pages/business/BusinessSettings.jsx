// Ayarlar: WhatsApp otomasyon varsayılanları + teslim saatleri + iletişim.
// Buradaki değerler botun otomatik yayınında kullanılır — fiyat tanımlı değilse
// WhatsApp cevapları admin onayına düşer (backend outreachService kuralı).
// Tema: işletme paneli tamamen aydınlıktır.
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MessageCircle, Clock, Package, Loader2, Info } from 'lucide-react';
import * as businessService from '../../services/businessService';
import { apiErrorMessage } from '../../services/api';
import { LightCard, SuccessButton, Spinner, useToasts, ToastStack } from '../../components/admin/AdminUI';

// Kategoriler tek kaynaktan gelir (backend enum'larıyla birebir)
import { BOX_CONTENTS as CONTENTS, MAX_CONTENTS } from '../../data/boxContents';

const inputCls = `w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900
  placeholder-gray-400 outline-none transition-all duration-300 ease-in-out
  focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10`;

export default function BusinessSettings() {
  const { me, reloadMe } = useOutletContext();
  const { toasts, push } = useToasts();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!me) return;
    setForm({
      defaultPackageCount: me.defaultPackageCount ?? '',
      defaultPrice: me.defaultPrice ?? '',
      defaultOriginalPrice: me.defaultOriginalPrice ?? '',
      pickupStart: me.pickupStart || '',
      pickupEnd: me.pickupEnd || '',
      whatsappPhone: me.whatsappPhone || '',
      contactPhone: me.contactPhone || '',
      boxContents: me.boxContents || [],
    });
  }, [me]);

  if (!form) {
    return <LightCard><div className="flex justify-center py-24"><Spinner className="h-7 w-7" /></div></LightCard>;
  }

  const toggleContent = (key) => {
    const on = form.boxContents.includes(key);
    if (!on && form.boxContents.length >= MAX_CONTENTS) {
      push(`Uygulamada karışık görünmemesi için en fazla ${MAX_CONTENTS} içerik seçebilirsin.`, 'error');
      return;
    }
    setForm((f) => ({
      ...f,
      boxContents: on ? f.boxContents.filter((c) => c !== key) : [...f.boxContents, key],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...(form.defaultPackageCount !== '' ? { defaultPackageCount: Number(form.defaultPackageCount) } : {}),
        ...(form.defaultPrice !== '' ? { defaultPrice: Number(form.defaultPrice) } : {}),
        ...(form.defaultOriginalPrice !== '' ? { defaultOriginalPrice: Number(form.defaultOriginalPrice) } : {}),
        ...(form.pickupStart ? { pickupStart: form.pickupStart } : {}),
        ...(form.pickupEnd ? { pickupEnd: form.pickupEnd } : {}),
        ...(form.whatsappPhone ? { whatsappPhone: form.whatsappPhone } : {}),
        ...(form.contactPhone ? { contactPhone: form.contactPhone } : {}),
        boxContents: form.boxContents,
      };
      const res = await businessService.updateProfile(payload);
      push(res.message || 'Ayarlar kaydedildi.');
      reloadMe();
    } catch (err) {
      push(apiErrorMessage(err, 'Kaydedilemedi.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const automationReady = form.defaultPackageCount > 0 && form.defaultPrice > 0 && form.defaultOriginalPrice > 0;

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ayarlar</h1>
        <p className="mt-1 text-sm text-gray-500">Günlük varsayılanlar ve WhatsApp otomasyonu</p>
      </div>

      <form onSubmit={submit} className="grid gap-5 xl:grid-cols-2">
        {/* Otomasyon varsayılanları */}
        <LightCard className="p-6">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-gray-900">
            <Package className="h-4 w-4 text-emerald-500" /> Günlük Varsayılanlar
          </h2>
          <p className="mb-5 text-xs leading-relaxed text-gray-400">
            WhatsApp'tan "5" yazdığında ya da cevap veremediğinde bot bu değerlerle kutunu otomatik yayınlar.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Paket Adedi</span>
              <input type="number" min="0" max="200" value={form.defaultPackageCount}
                onChange={(e) => setForm((f) => ({ ...f, defaultPackageCount: e.target.value }))}
                className={`admin-no-spinner ${inputCls}`} placeholder="5" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Fiyat (₺)</span>
              <input type="number" min="1" value={form.defaultPrice}
                onChange={(e) => setForm((f) => ({ ...f, defaultPrice: e.target.value }))}
                className={`admin-no-spinner ${inputCls}`} placeholder="200" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Değeri (₺)</span>
              <input type="number" min="1" value={form.defaultOriginalPrice}
                onChange={(e) => setForm((f) => ({ ...f, defaultOriginalPrice: e.target.value }))}
                className={`admin-no-spinner ${inputCls}`} placeholder="500" />
            </label>
          </div>

          <div className={`mt-4 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-relaxed transition-colors duration-300 ${
            automationReady
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}>
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            {automationReady
              ? 'Otomasyon hazır: bot cevabını sayıya çevirip kutunu anında yayınlayabilir.'
              : 'Üç değer de dolmadan otomatik yayın yapılmaz; WhatsApp cevapların ekip onayına düşer.'}
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Varsayılan Kutu İçeriği</span>
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

        {/* Saatler + iletişim */}
        <div className="flex flex-col gap-5">
          <LightCard className="p-6">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-gray-900">
              <Clock className="h-4 w-4 text-indigo-500" /> Teslim Saatleri
            </h2>
            <p className="mb-5 text-xs leading-relaxed text-gray-400">
              Bot, teslim başlangıcından 4 saat önce sana WhatsApp'tan sorar; 1 saat kala cevap yoksa varsayılanla yayınlar.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Başlangıç</span>
                <input type="time" value={form.pickupStart}
                  onChange={(e) => setForm((f) => ({ ...f, pickupStart: e.target.value }))}
                  className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Bitiş</span>
                <input type="time" value={form.pickupEnd}
                  onChange={(e) => setForm((f) => ({ ...f, pickupEnd: e.target.value }))}
                  className={inputCls} />
              </label>
            </div>
          </LightCard>

          <LightCard className="p-6">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-gray-900">
              <MessageCircle className="h-4 w-4 text-emerald-500" /> İletişim
            </h2>
            <p className="mb-5 text-xs text-gray-400">Botun sana ulaşacağı WhatsApp numarası.</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">WhatsApp</span>
                <input value={form.whatsappPhone}
                  onChange={(e) => setForm((f) => ({ ...f, whatsappPhone: e.target.value }))}
                  className={inputCls} placeholder="05XX XXX XX XX" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Sabit Telefon</span>
                <input value={form.contactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  className={inputCls} placeholder="0212 XXX XX XX" />
              </label>
            </div>
          </LightCard>

          <SuccessButton type="submit" disabled={saving} className="w-full py-3.5 text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ayarları Kaydet'}
          </SuccessButton>
        </div>
      </form>
    </div>
  );
}
