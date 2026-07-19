// Kutu & Teslimat: bugünün sürpriz kutusunu yayınla/güncelle + QR teslim onayı.
// Kutu yayını POST /business/boxes'a gider (yalnızca onaylı işletme — 403'te
// anlaşılır mesaj gösterilir). Satılan adet korunur, stok güvenle güncellenir.
import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, QrCode, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';
import * as businessService from '../../services/businessService';
import { apiErrorMessage } from '../../services/api';
import {
  GlassCard, Spinner, SuccessButton, useToasts, ToastStack,
} from '../../components/admin/AdminUI';

const CONTENTS = [
  { key: 'unlu', label: 'Unlu Mamül' },
  { key: 'sicak', label: 'Sıcak Yemek' },
  { key: 'meze', label: 'Meze & Aperatif' },
  { key: 'manav', label: 'Meyve & Sebze' },
  { key: 'karisik', label: 'Karışık' },
  { key: 'vegan', label: 'Vegan' },
];

const inputCls = `w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white
  placeholder-slate-600 outline-none transition-all duration-300 ease-in-out
  focus:border-emerald-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-emerald-500/40`;

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
    // me yüklendiğinde varsayılanlar forma insin diye me'ye bağlı
  }, [me, push]);

  const sold = useMemo(
    () => (box ? box.initialStock + box.extraStock - box.remaining : 0),
    [box]
  );

  const toggleContent = (key) => {
    setForm((f) => ({
      ...f,
      contents: f.contents.includes(key) ? f.contents.filter((c) => c !== key) : [...f.contents, key],
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
        <h1 className="text-2xl font-bold tracking-tight text-white">Kutu & Teslimat</h1>
        <p className="mt-1 text-sm text-slate-500">Bugünün sürpriz kutusunu yönet, teslimatta QR doğrula</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        {/* Kutu formu */}
        <GlassCard className="p-6 xl:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Package className="h-4 w-4 text-emerald-400" />
              {box ? 'Bugünün Kutusu' : 'Bugünün Kutusunu Yayınla'}
            </h2>
            {box && (
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-500">Satılan <b className="text-white">{sold}</b></span>
                <span className="text-slate-500">Kalan <b className="text-emerald-400">{box.remaining}</b></span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner className="h-7 w-7" /></div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">İndirimli Fiyat (₺)</span>
                  <input type="number" min="1" required value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className={`admin-no-spinner ${inputCls}`} placeholder="200" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">Normal Değeri (₺)</span>
                  <input type="number" min="1" required value={form.originalPrice}
                    onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                    className={`admin-no-spinner ${inputCls}`} placeholder="500" />
                </label>
                <label className="col-span-2 block sm:col-span-1">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">Kutu Adedi</span>
                  <input type="number" min="1" max="200" required value={form.initialStock}
                    onChange={(e) => setForm((f) => ({ ...f, initialStock: e.target.value }))}
                    className={`admin-no-spinner ${inputCls}`} placeholder="5" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">Teslim Başlangıç</span>
                  <input type="time" required value={form.pickupStart}
                    onChange={(e) => setForm((f) => ({ ...f, pickupStart: e.target.value }))}
                    className={`${inputCls} [color-scheme:dark]`} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">Teslim Bitiş</span>
                  <input type="time" required value={form.pickupEnd}
                    onChange={(e) => setForm((f) => ({ ...f, pickupEnd: e.target.value }))}
                    className={`${inputCls} [color-scheme:dark]`} />
                </label>
              </div>

              <div>
                <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">Kutu İçeriği</span>
                <div className="flex flex-wrap gap-2">
                  {CONTENTS.map((c) => {
                    const on = form.contents.includes(c.key);
                    return (
                      <button
                        type="button" key={c.key} onClick={() => toggleContent(c.key)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                          on
                            ? 'bg-emerald-500/[0.16] text-emerald-300 ring-1 ring-inset ring-emerald-400/30 shadow-[0_0_16px_rgba(16,185,129,0.12)]'
                            : 'bg-white/[0.04] text-slate-500 ring-1 ring-inset ring-white/10 hover:text-slate-300'
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* İndirim önizlemesi */}
              {form.price > 0 && form.originalPrice > 0 && Number(form.price) < Number(form.originalPrice) && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  Müşteri <b className="text-emerald-400">%{Math.round((1 - form.price / form.originalPrice) * 100)} indirimle</b> kurtaracak.
                </p>
              )}

              <SuccessButton type="submit" disabled={saving || form.contents.length === 0} className="w-full py-3 text-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (box ? 'Kutuyu Güncelle' : 'Kutuyu Yayınla')}
              </SuccessButton>
              {form.contents.length === 0 && (
                <p className="text-center text-[11px] text-slate-600">En az bir içerik türü seç.</p>
              )}
            </form>
          )}
        </GlassCard>

        {/* QR teslim onayı */}
        <GlassCard className="flex flex-col p-6 xl:col-span-2">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-white">
            <QrCode className="h-4 w-4 text-indigo-400" /> Teslimat Onayı
          </h2>
          <p className="mb-5 text-xs text-slate-500">
            Müşterinin uygulamadaki QR kodunu okut ya da kodu buraya yapıştır. Her kod tek kullanımlıktır.
          </p>

          <form onSubmit={verify} className="space-y-3">
            <input
              value={qr}
              onChange={(e) => setQr(e.target.value)}
              placeholder="QR kodu buraya yapıştır…"
              className={`${inputCls} font-mono text-xs focus:border-indigo-400/50 focus:ring-indigo-500/50`}
            />
            <button
              type="submit"
              disabled={verifying || !qr.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(99,102,241,0.35)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-indigo-400 active:scale-95 active:duration-100 disabled:pointer-events-none disabled:opacity-40"
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
                    ? 'border-emerald-500/25 bg-emerald-500/[0.08]'
                    : 'border-rose-500/25 bg-rose-500/[0.08]'
                }`}
              >
                {verifyResult.ok
                  ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />}
                <div>
                  <p className={`text-sm font-semibold ${verifyResult.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {verifyResult.message}
                  </p>
                  {verifyResult.customer && (
                    <p className="mt-0.5 text-xs text-slate-400">Müşteri: {verifyResult.customer}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-6">
            <p className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 text-[11px] leading-relaxed text-slate-500">
              💡 QR yalnızca ödemesi tamamlanmış siparişlerde üretilir; aynı kod ikinci kez okutulamaz, sahte kodlar imza doğrulamasından geçemez.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
