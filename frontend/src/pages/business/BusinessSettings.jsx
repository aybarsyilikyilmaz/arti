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
        <p className="mt-1 text-sm text-gray-500">İşletme iletişim bilgileri ve WhatsApp botu için şablon ayarları</p>
      </div>

      <form onSubmit={submit} className="max-w-md flex flex-col gap-5">
        <LightCard className="p-6">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-gray-900">
            <MessageCircle className="h-4 w-4 text-emerald-500" /> İletişim
          </h2>
          <p className="mb-5 text-xs text-gray-400">Sistem bildirimleri ve müşteri iletişimi için kullanılacak numaralar.</p>
          <div className="flex flex-col gap-4">
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
      </form>
    </div>
  );
}
