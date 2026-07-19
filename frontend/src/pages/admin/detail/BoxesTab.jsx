// Kutu & Vitrin sekmesi — admin buradan işletmenin müşteriye görünen HER
// şeyini yönetir: bugünkü kutuya stok/fiyat müdahalesi, kapak/logo yükleme,
// açıklama ve öne çıkan içerikler (anasayfa kartı + mağaza detayı).
// Telefon önizlemesi paylaşılan PhonePreview'dır ve yazarken canlı güncellenir.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Smartphone, Loader2, PackageX, Store, Sparkles, CheckCircle2 } from 'lucide-react';
import * as adminService from '../../../services/adminService';
import { apiErrorMessage } from '../../../services/api';
import { LightCard, Spinner, SuccessButton, EmptyState } from '../../../components/admin/AdminUI';
import PhonePreview from '../../../components/business/PhonePreview';
import DropZone, { IMAGE_TYPES } from '../../../components/business/DropZone';
import { BOX_CONTENTS as CONTENTS, MAX_CONTENTS } from '../../../data/boxContents';
import { inputCls, Field, SectionTitle } from './shared';

export default function BoxesTab({ business, reload, push }) {
  const [data, setData] = useState(null);   // {today, todayBox, recentBoxes}
  const [markupRate, setMarkupRate] = useState(10);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('liste');

  // Stok/fiyat müdahalesi
  const [basePrice, setBasePrice] = useState('');
  const [remaining, setRemaining] = useState('');
  const [applying, setApplying] = useState(false);

  // Vitrin düzenleme (kapak/logo/açıklama/içerikler)
  const [description, setDescription] = useState(business.description || '');
  const [contents, setContents] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(business.coverUrl || '');
  const [logoPreview, setLogoPreview] = useState(business.logoUrl || '');
  const [savingVitrin, setSavingVitrin] = useState(false);
  const [savedVitrin, setSavedVitrin] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, s] = await Promise.all([
        adminService.listBusinessBoxes(business._id),
        adminService.getPlatformSettings().catch(() => ({ data: { markupRate: 10 } }))
      ]);
      setData(d);
      setMarkupRate(s.data?.markupRate ?? 10);
      setBasePrice(d.todayBox?.basePrice ?? '');
      setRemaining(d.todayBox?.remaining ?? '');
      // İçerikte öncelik bugünkü kutuda (vitrin editörüyle aynı kural)
      setContents(d.todayBox?.contents?.length ? d.todayBox.contents : (business.boxContents || []));
    } catch (err) {
      push(apiErrorMessage(err, 'Kutular yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [business._id, business.boxContents, push]);

  useEffect(() => { load(); }, [load]);

  // Yerel blob önizlemelerini temizle (bellek sızıntısı olmasın)
  useEffect(() => () => {
    [coverPreview, logoPreview].forEach((u) => u?.startsWith('blob:') && URL.revokeObjectURL(u));
  }, [coverPreview, logoPreview]);

  const pickImage = (setFile, setPreview) => (file, err) => {
    if (err) { push(err, 'error'); return; }
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setSavedVitrin(false);
  };

  // Telefondaki kapak alanına tıklayınca da doğrudan fotoğraf yüklenebilir
  const phoneCoverInput = useRef(null);
  const onPhoneCoverPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) { push('Yalnızca JPEG, PNG veya WebP yükleyebilirsiniz.', 'error'); return; }
    pickImage(setCoverFile, setCoverPreview)(f, null);
    e.target.value = '';
  };

  const toggleContent = (key) => {
    const on = contents.includes(key);
    if (!on && contents.length >= MAX_CONTENTS) {
      push(`Uygulamada karışık görünmemesi için en fazla ${MAX_CONTENTS} içerik seçilebilir.`, 'error');
      return;
    }
    setContents((c) => (on ? c.filter((x) => x !== key) : [...c, key]));
    setSavedVitrin(false);
  };

  const saveVitrin = async () => {
    setSavingVitrin(true);
    try {
      const images = {};
      if (coverFile) images.coverUrl = await adminService.uploadBusinessImage(business._id, 'cover', coverFile);
      if (logoFile) images.logoUrl = await adminService.uploadBusinessImage(business._id, 'logo', logoFile);
      if (Object.keys(images).length > 0) await adminService.setBusinessImages(business._id, images);
      await adminService.updateBusinessProfile(business._id, { description, boxContents: contents });
      setCoverFile(null);
      setLogoFile(null);
      setSavedVitrin(true);
      push('Vitrin güncellendi — müşteriler artık bu görünümü görüyor. ✨');
      reload();
    } catch (err) {
      push(apiErrorMessage(err, err.message || 'Vitrin kaydedilemedi.'), 'error');
    } finally {
      setSavingVitrin(false);
    }
  };

  const apply = async () => {
    const payload = {};
    if (basePrice !== '' && Number(basePrice) !== data.todayBox.basePrice) payload.basePrice = Number(basePrice);
    if (remaining !== '' && Number(remaining) !== data.todayBox.remaining) payload.remaining = Number(remaining);
    if (Object.keys(payload).length === 0) { push('Değişiklik yok.', 'error'); return; }

    setApplying(true);
    try {
      const res = await adminService.patchTodayBox(business._id, payload);
      push(res.message);
      await load(); // 409 dahil her durumda taze stok görünsün
    } catch (err) {
      push(apiErrorMessage(err, 'Müdahale uygulanamadı.'), 'error');
      await load();
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <LightCard><div className="flex justify-center py-20"><Spinner className="h-7 w-7" /></div></LightCard>;
  }

  const box = data?.todayBox;
  const sold = box ? box.initialStock + box.extraStock - box.remaining : 0;

  // Önizleme canlıdır: fiyat/stok inputlarına yazılan değer anında telefona yansır
  const previewPrice = basePrice !== '' ? Math.round(Number(basePrice) * (1 + markupRate / 100)) : (box?.price ?? business.defaultPrice ?? null);
  const previewRemaining = remaining !== '' ? Number(remaining) : (box?.remaining ?? null);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_auto]">
      {/* Sol: müdahale + vitrin düzenleme + geçmiş */}
      <div className="space-y-5">
        <LightCard className="p-6">
          <SectionTitle icon={Package}>Bugünün Kutusu ({data?.today})</SectionTitle>
          {box ? (
            <>
              <div className="mb-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-gray-100 bg-gray-50 py-3">
                  <p className="text-xl font-black text-gray-900">{box.initialStock + box.extraStock}</p>
                  <p className="text-[11px] font-semibold text-gray-400">Toplam Stok</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 py-3">
                  <p className="text-xl font-black text-emerald-700">{box.remaining}</p>
                  <p className="text-[11px] font-semibold text-emerald-600">Kalan</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 py-3">
                  <p className="text-xl font-black text-gray-900">{sold}</p>
                  <p className="text-[11px] font-semibold text-gray-400">Satılan/Gitti</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label={`İşletme Hakedişi (₺) — normali ${box.originalPrice} ₺`}>
                  <input type="number" min="1" value={basePrice} onChange={(e) => setBasePrice(e.target.value)}
                    className={`admin-no-spinner ${inputCls}`} />
                </Field>
                <Field label="Kalan Stok (hedef)">
                  <input type="number" min="0" max="500" value={remaining} onChange={(e) => setRemaining(e.target.value)}
                    className={`admin-no-spinner ${inputCls}`} />
                </Field>
              </div>
              <p className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-gray-500">
                Stok artışı "ek stok" olarak işlenir; azaltma kalan adedi düşürür. O anda yeni sipariş
                düşerse sistem çakışmayı yakalar ve tekrar denemeni ister (veri asla bozulmaz).
              </p>
              <SuccessButton onClick={apply} disabled={applying} className="mt-4 w-full py-3">
                {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Müdahaleyi Uygula'}
              </SuccessButton>
            </>
          ) : (
            <EmptyState light icon={PackageX} title="Bugün yayınlanmış kutu yok"
              hint="İşletme kutu yayınladığında buradan stok ve fiyata müdahale edebilirsin." />
          )}
        </LightCard>

        {/* Vitrin düzenleme — anasayfa kartı + mağaza detayının tüm içeriği */}
        <LightCard className="p-6">
          <SectionTitle icon={Store}>Vitrin Düzenleme</SectionTitle>

          <div className="space-y-6">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Kapak Fotoğrafı</p>
              <DropZone
                label="Kapak fotoğrafını sürükle ya da tıkla"
                hint="JPEG · PNG · WebP — yatay önerilir"
                preview={coverPreview}
                onFile={pickImage(setCoverFile, setCoverPreview)}
              />
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Logo</p>
              <div className="w-32">
                <DropZone
                  label="Logo"
                  hint="Kare önerilir"
                  preview={logoPreview}
                  onFile={pickImage(setLogoFile, setLogoPreview)}
                  aspect="aspect-square"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">İşletme Açıklaması</p>
                <span className={`text-[11px] font-medium ${description.length > 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {description.length}/500
                </span>
              </div>
              <textarea
                value={description}
                maxLength={500}
                onChange={(e) => { setDescription(e.target.value); setSavedVitrin(false); }}
                rows={3}
                placeholder='"Kutuda ne olabilir?" bölümünde görünür — içeriği bir-iki cümleyle anlat.'
                className={`${inputCls} resize-none`}
              />
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Öne Çıkan İçerikler</p>
                <span className={`text-[11px] font-semibold ${contents.length >= MAX_CONTENTS ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {contents.length}/{MAX_CONTENTS} seçildi
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CONTENTS.map((c) => {
                  const on = contents.includes(c.key);
                  const full = !on && contents.length >= MAX_CONTENTS;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggleContent(c.key)}
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

            <SuccessButton onClick={saveVitrin} disabled={savingVitrin} className="w-full py-3">
              {savingVitrin
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : savedVitrin
                  ? <><CheckCircle2 className="h-4 w-4" /> Kaydedildi</>
                  : <><Sparkles className="h-4 w-4" /> Vitrini Yayınla</>}
            </SuccessButton>
          </div>
        </LightCard>

        <LightCard className="overflow-hidden">
          <div className="px-6 pt-5"><SectionTitle>Son 14 Gün</SectionTitle></div>
          {(data?.recentBoxes || []).length === 0 ? (
            <p className="px-6 pb-6 text-sm text-gray-400">Kayıtlı kutu geçmişi yok.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    <th className="px-6 py-3">Tarih</th>
                    <th className="px-6 py-3">Fiyat</th>
                    <th className="px-6 py-3">Stok</th>
                    <th className="px-6 py-3">Kalan</th>
                    <th className="px-6 py-3">Satılan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentBoxes.map((b) => (
                    <tr key={b._id} className="border-b border-gray-50 transition-colors duration-200 hover:bg-gray-50/60">
                      <td className="px-6 py-3 font-semibold text-gray-900">{b.date}</td>
                      <td className="px-6 py-3 text-gray-500">{b.basePrice} ₺ <span className="text-xs text-gray-300 line-through">{b.originalPrice} ₺</span></td>
                      <td className="px-6 py-3 text-gray-500">{b.initialStock + b.extraStock}</td>
                      <td className="px-6 py-3 text-gray-500">{b.remaining}</td>
                      <td className="px-6 py-3 font-semibold text-emerald-700">{b.initialStock + b.extraStock - b.remaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </LightCard>
      </div>

      {/* Sağ: müşterinin gördüğü — canlı, kapağa tıklayıp yükleme de var */}
      <div className="mx-auto text-center">
        <p className="mb-3 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
          <Smartphone className="h-3.5 w-3.5" /> Müşterinin Gördüğü (Canlı)
        </p>
        <div className="mx-auto mb-4 flex w-fit rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {[{ k: 'liste', label: 'Anasayfa (Liste)' }, { k: 'detay', label: 'Mağaza Detayı' }].map((t) => (
            <button
              key={t.k} type="button" onClick={() => setView(t.k)}
              className="relative rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors duration-300"
            >
              {view === t.k && (
                <motion.span
                  layoutId="admin-vitrin-pill"
                  transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                  className="absolute inset-0 rounded-lg bg-emerald-600 shadow-md shadow-emerald-600/25"
                />
              )}
              <span className={`relative z-10 ${view === t.k ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Kapak seçici input — telefon görünümlerinden bağımsız, hep bağlı */}
        <input
          ref={phoneCoverInput}
          type="file"
          accept={IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={onPhoneCoverPick}
        />

        <PhonePreview
          view={view}
          name={business.name}
          logoUrl={logoPreview}
          coverUrl={coverPreview}
          description={description}
          contents={contents}
          price={previewPrice}
          originalPrice={box?.originalPrice ?? business.defaultOriginalPrice ?? null}
          pickupStart={box?.pickupStart || business.pickupStart || null}
          pickupEnd={box?.pickupEnd || business.pickupEnd || null}
          addressLine={business.address || ''}
          locationLine={[business.district, business.city].filter(Boolean).join(', ')}
          district={business.district || ''}
          businessType={business.businessType || ''}
          remaining={previewRemaining}
          onCoverClick={() => phoneCoverInput.current?.click()}
        />

        <p className="mt-4 text-[11px] text-gray-400">
          {box
            ? 'Fiyat ve stok inputlara yazdıkça telefonda canlı güncellenir.'
            : 'Bugün yayında kutu yok — fiyat/saat işletmenin varsayılanlarından geliyor.'}
        </p>
      </div>
    </div>
  );
}
