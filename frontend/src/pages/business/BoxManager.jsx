// Kutu & Teslimat: bugünün sürpriz kutusunu yayınla/güncelle + QR teslim onayı.
// Tema: işletme paneli tamamen aydınlıktır.
import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, QrCode, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';
import * as businessService from '../../services/businessService';
import { apiErrorMessage } from '../../services/api';
import {
  LightCard, Spinner, SuccessButton, useToasts, ToastStack,
} from '../../components/admin/AdminUI';

// Kategoriler tek kaynaktan gelir (backend enum'larıyla birebir)
import { BOX_CONTENTS as CONTENTS, MAX_CONTENTS } from '../../data/boxContents';

const inputCls = `w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900
  placeholder-gray-400 outline-none transition-all duration-300 ease-in-out
  focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10`;

export default function BoxManager() {
  const { me } = useOutletContext();
  const { toasts, push } = useToasts();
  const [box, setBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    price: '', originalPrice: '', initialStock: '', contents: [], pickupStart: '', pickupEnd: '',
  });

  // QR doğrulama durumu
  const [qr, setQr] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null); // {ok, message, customer?}

  useEffect(() => {
    businessService.getTodayBox()
      .then((b) => {
        setBox(b);
        setForm({
          price: b?.price ?? me?.defaultPrice ?? '',
          originalPrice: b?.originalPrice ?? me?.defaultOriginalPrice ?? '',
          initialStock: b?.initialStock ?? me?.defaultPackageCount ?? '',
          contents: b?.contents?.length ? b.contents : (me?.boxContents || []),
          pickupStart: b?.pickupStart || me?.pickupStart || '18:00',
          pickupEnd: b?.pickupEnd || me?.pickupEnd || '21:00',
        });
      })
      .catch((err) => push(apiErrorMessage(err, 'Kutu bilgisi alınamadı.'), 'error'))
      .finally(() => setLoading(false));
  }, [me, push]);

  const sold = useMemo(
    () => (box ? box.initialStock + box.extraStock - box.remaining : 0),
    [box]
  );

  const toggleContent = (key) => {
    const on = form.contents.includes(key);
    if (!on && form.contents.length >= MAX_CONTENTS) {
      push(`Uygulamada karışık görünmemesi için en fazla ${MAX_CONTENTS} içerik seçebilirsin.`, 'error');
      return;
    }
    setForm((f) => ({
      ...f,
      contents: on ? f.contents.filter((c) => c !== key) : [...f.contents, key],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await businessService.upsertTodayBox({
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        initialStock: Number(form.initialStock),
        contents: form.contents,
        pickupStart: form.pickupStart,
        pickupEnd: form.pickupEnd,
      });
      setBox(saved);
      push(box ? 'Kutu güncellendi.' : 'Bugünün kutusu yayınlandı! Favorileyen müşterilere bildirim gitti.');
    } catch (err) {
      push(apiErrorMessage(err, 'Kutu kaydedilemedi.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    if (!qr.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await businessService.verifyPickup(qr.trim());
      setVerifyResult({ ok: true, message: res.message, customer: res.data?.order?.customer });
      setQr('');
    } catch (err) {
      setVerifyResult({ ok: false, message: apiErrorMessage(err, 'Doğrulama başarısız.') });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Kutu & Teslimat</h1>
        <p className="mt-1 text-sm text-gray-500">Bugünün sürpriz kutusunu yönet, teslimatta QR doğrula</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        {/* Kutu formu */}
        <LightCard className="p-6 xl:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Package className="h-4 w-4 text-emerald-500" />
              {box ? 'Bugünün Kutusu' : 'Bugünün Kutusunu Yayınla'}
            </h2>
            {box && (
              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-400">Satılan <b className="text-gray-900">{sold}</b></span>
                <span className="text-gray-400">Kalan <b className="text-emerald-600">{box.remaining}</b></span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">İndirimli Fiyat (₺)</span>
                  <input type="number" min="1" required value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className={`admin-no-spinner ${inputCls}`} placeholder="200" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Normal Değeri (₺)</span>
                  <input type="number" min="1" required value={form.originalPrice}
                    onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                    className={`admin-no-spinner ${inputCls}`} placeholder="500" />
                </label>
                <label className="col-span-2 block sm:col-span-1">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Kutu Adedi</span>
                  <input type="number" min="1" max="200" required value={form.initialStock}
                    onChange={(e) => setForm((f) => ({ ...f, initialStock: e.target.value }))}
                    className={`admin-no-spinner ${inputCls}`} placeholder="5" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Teslim Başlangıç</span>
                  <input type="time" required value={form.pickupStart}
                    onChange={(e) => setForm((f) => ({ ...f, pickupStart: e.target.value }))}
                    className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">Teslim Bitiş</span>
                  <input type="time" required value={form.pickupEnd}
                    onChange={(e) => setForm((f) => ({ ...f, pickupEnd: e.target.value }))}
                    className={inputCls} />
                </label>
              </div>

              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Kutu İçeriği</span>
                  <span className={`text-[11px] font-semibold ${form.contents.length >= MAX_CONTENTS ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {form.contents.length}/{MAX_CONTENTS} seçildi
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CONTENTS.map((c) => {
                    const on = form.contents.includes(c.key);
                    const full = !on && form.contents.length >= MAX_CONTENTS;
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
                <p className="mt-2 text-[11px] text-gray-400">
                  En fazla {MAX_CONTENTS} içerik — müşteri kartında net görünsün diye. Seçimin anasayfa kartındaki çiplerde görünür.
                </p>
              </div>

              {/* İndirim önizlemesi */}
              {form.price > 0 && form.originalPrice > 0 && Number(form.price) < Number(form.originalPrice) && (
                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  Müşteri <b className="text-emerald-600">%{Math.round((1 - form.price / form.originalPrice) * 100)} indirimle</b> kurtaracak.
                </p>
              )}

              <SuccessButton type="submit" disabled={saving || form.contents.length === 0} className="w-full py-3 text-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (box ? 'Kutuyu Güncelle' : 'Kutuyu Yayınla')}
              </SuccessButton>
              {form.contents.length === 0 && (
                <p className="text-center text-[11px] text-gray-400">En az bir içerik türü seç.</p>
              )}
            </form>
          )}
        </LightCard>

        {/* QR teslim onayı */}
        <LightCard className="flex flex-col p-6 xl:col-span-2">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-gray-900">
            <QrCode className="h-4 w-4 text-indigo-500" /> Teslimat Onayı
          </h2>
          <p className="mb-5 text-xs text-gray-400">
            Müşterinin uygulamadaki QR kodunu okut ya da kodu buraya yapıştır. Her kod tek kullanımlıktır.
          </p>

          <form onSubmit={verify} className="space-y-3">
            <input
              value={qr}
              onChange={(e) => setQr(e.target.value)}
              placeholder="QR kodu buraya yapıştır…"
              className={`${inputCls} font-mono text-xs focus:border-indigo-500 focus:ring-indigo-500/10`}
            />
            <button
              type="submit"
              disabled={verifying || !qr.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-indigo-500 active:scale-95 active:duration-100 disabled:pointer-events-none disabled:opacity-40"
            >
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Doğrula ve Teslim Et</>}
            </button>
          </form>

          <AnimatePresence mode="wait">
            {verifyResult && (
              <motion.div
                key={verifyResult.message}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`mt-5 flex items-start gap-3 rounded-xl border p-4 ${
                  verifyResult.ok
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-rose-200 bg-rose-50'
                }`}
              >
                {verifyResult.ok
                  ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />}
                <div>
                  <p className={`text-sm font-semibold ${verifyResult.ok ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {verifyResult.message}
                  </p>
                  {verifyResult.customer && (
                    <p className="mt-0.5 text-xs text-gray-500">Müşteri: {verifyResult.customer}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-6">
            <p className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-[11px] leading-relaxed text-gray-500">
              💡 QR yalnızca ödemesi tamamlanmış siparişlerde üretilir; aynı kod ikinci kez okutulamaz, sahte kodlar imza doğrulamasından geçemez.
            </p>
          </div>
        </LightCard>
      </div>
    </div>
  );
}
