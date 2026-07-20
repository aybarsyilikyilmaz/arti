// Vitrin Yönetimi — işletmenin müşteri uygulamasındaki görünümünü düzenlediği ekran.
//
// KURALLAR (kullanıcı talebi):
//  1. Telefon içeriği prototype.html'deki müşteri UI'ı ile BİREBİR — çizim
//     artık paylaşılan PhonePreview bileşeninde (admin paneli de aynısını
//     kullanır, iki taraf asla ayrışmaz).
//  2. HİÇBİR VERİ HARDCODE DEĞİL: fiyat/saat/adres/isim, bugünün kutusundan
//     (yoksa profildeki varsayılanlardan) canlı okunur; sayfa her açılışta
//     API'den taze veri çeker (reloadMe + getTodayBox).
//  3. Tamamen beyaz, ferah sayfa (koyu tema kalıntısı yok).
//  4. Kapak alanına telefon içinden tıklanarak da fotoğraf yüklenebilir.
import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Sparkles, Loader2, CheckCircle2, Smartphone } from 'lucide-react';
import * as businessService from '../../services/businessService';
import { apiErrorMessage } from '../../services/api';
import { useToasts, ToastStack } from '../../components/admin/AdminUI';
import PhonePreview from '../../components/business/PhonePreview';
import DropZone, { IMAGE_TYPES } from '../../components/business/DropZone';

// Kategoriler tek kaynaktan gelir (backend enum'larıyla birebir)
import { BOX_CONTENTS as CONTENTS, MAX_CONTENTS } from '../../data/boxContents';

export default function StorefrontEditor() {
  const { me, reloadMe } = useOutletContext();
  const { toasts, push } = useToasts();

  const [box, setBox] = useState(null); // bugünün kutusu — fiyat/saat önceliği ondadır
  const [view, setView] = useState('liste'); // 'liste' (Keşfet kartı) | 'detay' (mağaza sayfası)
  const [description, setDescription] = useState('');
  const [contents, setContents] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [detailFile, setDetailFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [detailPreview, setDetailPreview] = useState('');
  const [useCoverAsDetail, setUseCoverAsDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sayfa her açılışta TAZE veri çeker — başka sekmede yapılan değişiklikler
  // (kutu fiyatı, ayarlar) burada anında görünür. Hardcode yok.
  useEffect(() => {
    reloadMe();
    businessService.getTodayBox().then(setBox).catch(() => setBox(null));
  }, [reloadMe]);

  // Mevcut vitrin bilgileri forma iner — içerikte öncelik bugünkü kutuda:
  // Kutu & Teslimat'ta seçilenler anasayfa kartında aynen görünsün
  useEffect(() => {
    if (!me) return;
    setDescription(me.description || '');
    setContents(box?.contents?.length ? box.contents : (me.boxContents || []));
    setCoverPreview((p) => p || me.coverUrl || '');
    setLogoPreview((p) => p || me.logoUrl || '');
    setDetailPreview((p) => p || me.detailUrl || '');
    if (me.coverUrl && me.coverUrl === me.detailUrl) setUseCoverAsDetail(true);
  }, [me, box]);

  // Blob önizlemeleri YALNIZCA unmount'ta serbest bırakılır. Bağımlılığa bağlı
  // cleanup, ikinci görsel seçilince hâlâ ekranda olan ilk blob'u revoke edip
  // önizlemeyi kırıyordu (F5 sunucu URL'ini getirdiği için düzeliyordu).
  const previewsRef = useRef({ coverPreview, logoPreview, detailPreview });
  useEffect(() => { previewsRef.current = { coverPreview, logoPreview, detailPreview }; }, [coverPreview, logoPreview, detailPreview]);
  useEffect(() => () => {
    Object.values(previewsRef.current).forEach((u) => u?.startsWith('blob:') && URL.revokeObjectURL(u));
  }, []);

  const pickImage = (setFile, setPreview) => (file, err) => {
    if (err) { push(err, 'error'); return; }
    setFile(file);
    // Bu slotun önceki blob'unu değiştirirken serbest bırak (diğerlerine dokunma)
    setPreview((prev) => {
      if (typeof prev === 'string' && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    }); // canlı önizleme anında güncellenir
    setSaved(false);
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
      push(`Uygulamada karışık görünmemesi için en fazla ${MAX_CONTENTS} içerik seçebilirsin.`, 'error');
      return;
    }
    setContents((c) => (on ? c.filter((x) => x !== key) : [...c, key]));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const images = {};
      if (coverFile) images.coverUrl = await businessService.uploadImage('cover', coverFile);
      if (logoFile) images.logoUrl = await businessService.uploadImage('logo', logoFile);
      
      if (useCoverAsDetail) {
        images.detailUrl = images.coverUrl || me.coverUrl;
      } else if (detailFile) {
        images.detailUrl = await businessService.uploadImage('detail', detailFile);
      }
      
      if (Object.keys(images).length > 0) await businessService.setImages(images);
      await businessService.updateProfile({ description, boxContents: contents });
      setCoverFile(null);
      setLogoFile(null);
      setDetailFile(null);
      setSaved(true);
      reloadMe();
      push('Vitrin güncellendi — müşteriler artık bu görünümü görüyor. ✨');
    } catch (err) {
      push(apiErrorMessage(err, err.message || 'Vitrin kaydedilemedi.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // --- %100 DİNAMİK veri kaynakları: önce bugünün kutusu, yoksa profil ---
  const name = me?.name || '';
  const price = box?.price ?? me?.defaultPrice ?? null;
  const originalPrice = box?.originalPrice ?? me?.defaultOriginalPrice ?? null;
  const pickupStart = box?.pickupStart || me?.pickupStart || null;
  const pickupEnd = box?.pickupEnd || me?.pickupEnd || null;
  const addressLine = [me?.address, me?.district, me?.city].filter(Boolean).join(', ');
  const locationLine = [me?.district, me?.city].filter(Boolean).join(', ');
  const remaining = box?.remaining ?? null;

  return (
    <div className="text-gray-900">
      <ToastStack toasts={toasts} />

      {/* Bembeyaz sayfa */}
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
        {/* Başlık şeridi */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-8 py-6">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-gray-900">
              <span className="rounded-xl bg-emerald-100 p-2 text-emerald-600"><Store className="h-5 w-5" /></span>
              Vitrin Yönetimi
            </h1>
            <p className="mt-1 text-sm text-gray-500">Müşteri uygulamasında nasıl görüneceğini buradan yönet — sağdaki telefon canlı önizlemedir.</p>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95 active:duration-100 disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {saving ? 'Kaydediliyor…' : saved ? 'Kaydedildi' : 'Vitrini Yayınla'}
          </button>
        </div>

        {/* İki kolonlu düzen */}
        <div className="grid gap-10 p-8 lg:grid-cols-2">
          {/* ---------- SOL: Veri girişi ---------- */}
          <div className="space-y-7">
            <section>
              <div className="mb-1 flex items-baseline justify-between">
                <h2 className="text-sm font-bold text-gray-900">Kapak Fotoğrafı</h2>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-emerald-600 hover:text-emerald-700">
                  <input
                    type="checkbox"
                    checked={useCoverAsDetail}
                    onChange={(e) => {
                      setUseCoverAsDetail(e.target.checked);
                      if (e.target.checked) setSaved(false);
                    }}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Detay sayfasına da bunu koy
                </label>
              </div>
              <p className="mb-3 text-xs text-gray-400">Keşfet listesi ekranının üstünde tam genişlikte görünür. Önerilen: yatay, 1200×400.</p>
              <DropZone
                label="Kapak fotoğrafını sürükle ya da tıkla"
                hint="JPEG · PNG · WebP"
                preview={coverPreview}
                onFile={pickImage(setCoverFile, setCoverPreview)}
              />
            </section>

            <section>
              <h2 className="mb-1 text-sm font-bold text-gray-900">Logo</h2>
              <p className="mb-3 text-xs text-gray-400">Kare çalışır en iyi — kapakla çakışmayan sade bir görsel seç.</p>
              <div className="w-36">
                <DropZone
                  label="Logo"
                  hint="Kare önerilir"
                  preview={logoPreview}
                  onFile={pickImage(setLogoFile, setLogoPreview)}
                  aspect="aspect-square"
                />
              </div>
            </section>

            {!useCoverAsDetail && (
              <section>
                <h2 className="mb-1 text-sm font-bold text-gray-900">Detay Sayfası Fotoğrafı</h2>
                <p className="mb-3 text-xs text-gray-400">Mağazanın kendi sayfasının en üstünde görünür. Önerilen: yatay, 1200×400.</p>
                <DropZone
                  label="Detay fotoğrafını sürükle ya da tıkla"
                  hint="JPEG · PNG · WebP"
                  preview={detailPreview}
                  onFile={pickImage(setDetailFile, setDetailPreview)}
                />
              </section>
            )}

            <section>
              <div className="mb-1 flex items-baseline justify-between">
                <h2 className="text-sm font-bold text-gray-900">İşletme Açıklaması</h2>
                <span className={`text-[11px] font-medium ${description.length > 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {description.length}/500
                </span>
              </div>
              <p className="mb-3 text-xs text-gray-400">"Kutuda ne olabilir?" bölümünde görünür — içeriğini bir-iki cümleyle anlat.</p>
              <textarea
                value={description}
                maxLength={500}
                onChange={(e) => { setDescription(e.target.value); setSaved(false); }}
                rows={4}
                placeholder="örn: Taze, yüksek kaliteli ürünlerin bir karışımı: sandviçler, hamur işleri ve mevsimlik ürünler. İçerik günlük olarak değişir!"
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm leading-relaxed text-gray-800 placeholder-gray-400 outline-none transition-all duration-300 ease-in-out focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </section>

            <section>
              <div className="mb-1 flex items-baseline justify-between">
                <h2 className="text-sm font-bold text-gray-900">Öne Çıkan İçerikler</h2>
                <span className={`text-[11px] font-semibold ${contents.length >= MAX_CONTENTS ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {contents.length}/{MAX_CONTENTS} seçildi
                </span>
              </div>
              <p className="mb-3 text-xs text-gray-400">En fazla {MAX_CONTENTS} seçim — anasayfa kartında çip, detayda madde imli liste olarak görünür.</p>
              <div className="flex flex-wrap gap-2">
                {CONTENTS.map((c) => {
                  const on = contents.includes(c.key);
                  const full = !on && contents.length >= MAX_CONTENTS;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggleContent(c.key)}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                        on
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                          : full
                            ? 'cursor-not-allowed bg-gray-50 text-gray-300'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                      }`}
                    >
                      <span className={full ? 'opacity-40 grayscale' : ''}>{c.emoji}</span> {c.short}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Dinamik veri bilgilendirmesi — fiyat/saat buradan DEĞİL, gerçek veriden gelir */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-[11px] leading-relaxed text-gray-500">
              💡 Telefondaki <b className="text-gray-700">fiyat, stok ve teslim saati</b> elle yazılmaz:
              bugün yayında kutun varsa ondan, yoksa Ayarlar'daki varsayılanlarından canlı okunur.
              Kutu &amp; Teslimat ya da Ayarlar'da değişiklik yapıp buraya döndüğünde önizleme kendini günceller.
            </div>
          </div>

          {/* ---------- SAĞ: Canlı telefon mockup'ı (paylaşılan PhonePreview) ---------- */}
          <div className="flex items-start justify-center lg:sticky lg:top-8">
            <div className="text-center">
              <p className="mb-3 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                <Smartphone className="h-3.5 w-3.5" /> Canlı Önizleme
              </p>

              {/* Görünüm seçici — Anasayfa kartı / Mağaza detayı */}
              <div className="mx-auto mb-4 flex w-fit rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                {[
                  { k: 'liste', label: 'Anasayfa (Liste)' },
                  { k: 'detay', label: 'Mağaza Detayı' },
                ].map((t) => (
                  <button
                    key={t.k}
                    type="button"
                    onClick={() => setView(t.k)}
                    className="relative rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors duration-300"
                  >
                    {view === t.k && (
                      <motion.span
                        layoutId="vitrin-view-pill"
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

              {/* Kapak seçici input — telefon görünümlerinden bağımsız, hep bağlı kalır */}
              <input
                ref={phoneCoverInput}
                type="file"
                accept={IMAGE_TYPES.join(',')}
                className="hidden"
                onChange={onPhoneCoverPick}
              />

              <PhonePreview
                view={view}
                name={name}
                logoUrl={logoPreview}
                coverUrl={coverPreview}
                detailUrl={useCoverAsDetail ? coverPreview : detailPreview}
                description={description}
                contents={contents}
                price={price}
                originalPrice={originalPrice}
                pickupStart={pickupStart}
                pickupEnd={pickupEnd}
                addressLine={addressLine}
                mapsUrl={me?.mapsUrl || ''}
                locationLine={locationLine}
                district={me?.district || ''}
                businessType={me?.businessType || ''}
                remaining={remaining}
                onCoverClick={() => phoneCoverInput.current?.click()}
              />

              <p className="mt-4 text-[11px] text-gray-400">
                {box
                  ? `Fiyat ve saat bugünün yayındaki kutusundan geliyor (kalan: ${box.remaining})`
                  : 'Bugün yayında kutu yok — fiyat ve saat Ayarlar\'daki varsayılanlardan geliyor'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
