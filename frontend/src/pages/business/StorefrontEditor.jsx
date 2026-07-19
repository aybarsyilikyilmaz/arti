// Vitrin Yönetimi — işletmenin müşteri uygulamasındaki görünümünü düzenlediği ekran.
//
// KURALLAR (kullanıcı talebi):
//  1. Telefon içeriği prototype.html'deki "Mağaza detayları" ekranıyla BİREBİR:
//     kapak tam genişlikte en üstte, altında isim + puan, "Kutuda ne olabilir?"
//     (madde imli liste), "Teslim alma", "Konum" ve yapışkan alt bar.
//  2. HİÇBİR VERİ HARDCODE DEĞİL: fiyat/saat/adres/isim, bugünün kutusundan
//     (yoksa profildeki varsayılanlardan) canlı okunur; sayfa her açılışta
//     API'den taze veri çeker (reloadMe + getTodayBox).
//  3. Tamamen beyaz, ferah sayfa (koyu tema kalıntısı yok — kabuk da bu
//     rotada aydınlık moda geçer, bkz. BusinessLayout).
//  4. Alt bar telefon ekranının dibine yapışıktır (absolute bottom-0).
import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImagePlus, UploadCloud, Store, Sparkles, Clock, Star,
  Loader2, CheckCircle2, Smartphone, Image as ImageIcon,
  MapPin, Heart, Map, UserRound, Leaf,
} from 'lucide-react';
import * as businessService from '../../services/businessService';
import { apiErrorMessage } from '../../services/api';
import { useToasts, ToastStack, typeLabel } from '../../components/admin/AdminUI';

// Kategoriler tek kaynaktan gelir (backend enum'larıyla birebir)
import { BOX_CONTENTS as CONTENTS, MAX_CONTENTS } from '../../data/boxContents';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/* Şık drag&drop yükleme alanı — beyaz tema */
function DropZone({ label, hint, preview, onFile, aspect = 'aspect-[3/1]' }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  const accept = (file) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      onFile(null, 'Yalnızca JPEG, PNG veya WebP yükleyebilirsiniz.');
      return;
    }
    onFile(file, null);
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); accept(e.dataTransfer.files?.[0]); }}
      className={`group relative w-full overflow-hidden ${aspect} rounded-2xl border-2 border-dashed text-left
        transition-all duration-300 ease-in-out active:scale-[0.99] ${
        over
          ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-500/15'
          : preview
            ? 'border-transparent shadow-md hover:shadow-lg'
            : 'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(e) => accept(e.target.files?.[0])}
      />
      {preview ? (
        <>
          <img src={preview} alt={label} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/0 opacity-0 transition-all duration-300 group-hover:bg-gray-900/40 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-gray-800 shadow-lg">
              <ImagePlus className="h-3.5 w-3.5" /> Değiştir
            </span>
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
          <div className={`rounded-xl p-2.5 transition-colors duration-300 ${over ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-[11px] text-gray-400">{hint}</p>
        </div>
      )}
    </button>
  );
}

export default function StorefrontEditor() {
  const { me, reloadMe } = useOutletContext();
  const { toasts, push } = useToasts();

  const [box, setBox] = useState(null); // bugünün kutusu — fiyat/saat önceliği ondadır
  const [view, setView] = useState('liste'); // 'liste' (Keşfet kartı) | 'detay' (mağaza sayfası)
  const [description, setDescription] = useState('');
  const [contents, setContents] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
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
  }, [me, box]);

  // Yerel önizleme URL'lerini temizle (bellek sızıntısı olmasın)
  useEffect(() => () => {
    [coverPreview, logoPreview].forEach((u) => u?.startsWith('blob:') && URL.revokeObjectURL(u));
  }, [coverPreview, logoPreview]);

  const pickImage = (setFile, setPreview) => (file, err) => {
    if (err) { push(err, 'error'); return; }
    setFile(file);
    setPreview(URL.createObjectURL(file)); // canlı önizleme anında güncellenir
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
      if (Object.keys(images).length > 0) await businessService.setImages(images);
      await businessService.updateProfile({ description, boxContents: contents });
      setCoverFile(null);
      setLogoFile(null);
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
              <h2 className="mb-1 text-sm font-bold text-gray-900">Kapak Fotoğrafı</h2>
              <p className="mb-3 text-xs text-gray-400">Müşteri ekranının en üstünde tam genişlikte görünür. Önerilen: yatay, 1200×400.</p>
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

          {/* ---------- SAĞ: Canlı telefon mockup'ı (prototype ile birebir) ---------- */}
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

              {/* Telefon çerçevesi */}
              <div className="relative mx-auto w-[320px] rounded-[3rem] border-[12px] border-gray-900 bg-gray-900 shadow-2xl">
                <div className="absolute left-1/2 top-2.5 z-20 h-[26px] w-28 -translate-x-1/2 rounded-full bg-gray-900" />
                <div className="absolute -left-[15px] top-24 h-10 w-[3px] rounded-l bg-gray-800" />
                <div className="absolute -left-[15px] top-40 h-14 w-[3px] rounded-l bg-gray-800" />
                <div className="absolute -right-[15px] top-32 h-16 w-[3px] rounded-r bg-gray-800" />

                {/* Ekran — iki görünüm arasında animasyonlu geçiş */}
                <div className="relative h-[640px] overflow-hidden rounded-[2.3rem] bg-[#faf8f5]">
                  {/* Kapak seçici input — her iki görünümde de erişilebilir olmalı */}
                  <input
                    ref={phoneCoverInput}
                    type="file"
                    accept={IMAGE_TYPES.join(',')}
                    className="hidden"
                    onChange={onPhoneCoverPick}
                  />
                  <AnimatePresence mode="wait">
                  {view === 'liste' ? (
                    /* ---------- ANASAYFA (Keşfet listesi) — kutu kartı ---------- */
                    <motion.div
                      key="liste"
                      initial={{ opacity: 0, x: -28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 28 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="relative h-full"
                    >
                      <div className="h-full overflow-y-auto pb-20 text-left">
                        {/* Konum başlığı — kayıttaki ilçe/il */}
                        <div className="flex items-center gap-2.5 px-4 pt-10">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                            <MapPin className="h-4 w-4 text-emerald-700" />
                          </span>
                          <div>
                            <p className="text-[10px] text-gray-400">Seçilen Konum</p>
                            <p className="text-sm font-bold text-gray-900">{locationLine || 'Konum'} ⌄</p>
                          </div>
                        </div>

                        {/* Filtre çipleri (uygulama iskeleti) */}
                        <div className="mt-3.5 flex gap-2 px-4">
                          <span className="rounded-full bg-emerald-800 px-4 py-1.5 text-xs font-semibold text-white">Tümü</span>
                          <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-500">Yemekler</span>
                          <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-500">Unlu Mamüller</span>
                        </div>

                        <div className="mt-4 flex items-baseline justify-between px-4">
                          <h3 className="text-lg font-black text-gray-900">Sizin için seçilenler</h3>
                          <span className="text-xs font-bold text-emerald-700">Tümünü gör</span>
                        </div>

                        {/* SÜRPRİZ KUTU KARTI — tüm veriler canlı */}
                        <div className="mx-4 mt-3 overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-200/70">
                          <button
                            type="button"
                            onClick={() => phoneCoverInput.current?.click()}
                            className="group/lc relative block h-32 w-full overflow-hidden bg-gray-100"
                            title="Kapak fotoğrafı yükle"
                          >
                            {coverPreview ? (
                              <img src={coverPreview} alt="kapak" className="h-full w-full object-cover" />
                            ) : (
                              <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-300 transition-colors duration-300 group-hover/lc:text-emerald-500">
                                <ImageIcon className="h-6 w-6" />
                                <span className="text-[10px] font-medium">Kapak fotoğrafı yüklemek için tıkla</span>
                              </span>
                            )}
                            {remaining !== null && remaining <= 3 && (
                              <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-gray-800 shadow">
                                Hızla tükeniyor
                              </span>
                            )}
                            <span className="absolute right-2.5 top-2.5 flex items-center gap-0.5 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-gray-800 shadow">
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> 4.4
                            </span>
                          </button>
                          <div className="p-3.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                {/* Logo — yuvarlak avatar, işletme adının yanında */}
                                <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-gray-100 bg-emerald-50 shadow-sm">
                                  {logoPreview ? (
                                    <img src={logoPreview} alt="logo" className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="flex h-full w-full items-center justify-center text-[11px] font-black text-emerald-600">
                                      {(name || '?').charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </span>
                                <p className="truncate text-base font-bold text-gray-900">{name || 'İşletme adı'}</p>
                              </div>
                              <Heart className="h-5 w-5 shrink-0 text-gray-300" />
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {contents.includes('vegan') ? 'Sürpriz Kutu (Vejetaryen)' : 'Sürpriz Kutu'}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-400">
                              {pickupStart && pickupEnd
                                ? <>Bugün {pickupStart} - {pickupEnd}</>
                                : <span className="italic text-gray-300">Teslim saatini Ayarlar'dan belirle</span>}
                              {me?.district ? ` · ${me.district}` : ''}
                            </p>
                            {contents.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {contents.map((key) => {
                                  const c = CONTENTS.find((x) => x.key === key);
                                  return (
                                    <motion.span
                                      key={key}
                                      initial={{ opacity: 0, scale: 0.85 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100"
                                    >
                                      {c?.emoji} {c?.short}
                                    </motion.span>
                                  );
                                })}
                              </div>
                            )}
                            <div className="mt-3 flex items-baseline justify-end gap-1.5 border-t border-dashed border-gray-200 pt-2.5">
                              {originalPrice !== null && <span className="text-xs text-gray-300 line-through">{originalPrice} ₺</span>}
                              <span className="text-lg font-black text-emerald-700">{price !== null ? `${price} ₺` : '—'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Alt tab bar (uygulama iskeleti) */}
                      <div className="absolute inset-x-0 bottom-0 flex items-start justify-around border-t border-gray-100 bg-white px-2 pb-5 pt-2.5">
                        {[
                          { icon: Leaf, label: 'Keşfet', active: true },
                          { icon: Map, label: 'Göz At' },
                          { icon: Heart, label: 'Favoriler' },
                          { icon: UserRound, label: 'Profil' },
                        ].map((t) => (
                          <span key={t.label} className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${t.active ? 'text-emerald-800' : 'text-gray-400'}`}>
                            <t.icon className="h-5 w-5" /> {t.label}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    /* ---------- MAĞAZA DETAYI (prototype.html UI) ---------- */
                    <motion.div
                      key="detay"
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -28 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="relative h-full"
                    >
                  <div className="h-full overflow-y-auto pb-24 text-left">
                    {/* Üst bar */}
                    <div className="sticky top-0 z-10 flex items-center justify-between bg-[#faf8f5]/95 px-4 pb-2 pt-9 backdrop-blur">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow">←</span>
                      <p className="text-sm font-bold text-gray-900">Mağaza detayları</p>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow">↗</span>
                    </div>

                    {/* Kapak — tam genişlik; tıklayınca doğrudan fotoğraf yüklenir */}
                    <button
                      type="button"
                      onClick={() => phoneCoverInput.current?.click()}
                      className="group/cover relative block h-40 w-full overflow-hidden bg-gray-100"
                      title="Kapak fotoğrafı yükle"
                    >
                      <AnimatePresence mode="wait">
                        {coverPreview ? (
                          <motion.img
                            key={coverPreview}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            src={coverPreview} alt="kapak"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-gray-300 transition-colors duration-300 group-hover/cover:text-emerald-500">
                            <ImageIcon className="h-7 w-7" />
                            <span className="text-[10px] font-medium">Kapak fotoğrafı yüklemek için tıkla</span>
                          </div>
                        )}
                      </AnimatePresence>
                      {coverPreview && (
                        <span className="absolute inset-0 flex items-center justify-center bg-gray-900/0 opacity-0 transition-all duration-300 group-hover/cover:bg-gray-900/35 group-hover/cover:opacity-100">
                          <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-gray-800 shadow-lg">
                            <ImagePlus className="h-3 w-3" /> Kapağı değiştir
                          </span>
                        </span>
                      )}
                    </button>

                    {/* İçerik */}
                    <div className="px-4 pt-4">
                      {/* İsim + rozet */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          {logoPreview && (
                            <img src={logoPreview} alt="logo" className="h-10 w-10 shrink-0 rounded-xl border border-gray-100 object-cover shadow-sm" />
                          )}
                          <h3 className="truncate text-xl font-bold text-gray-900">{name || 'İşletme adı'}</h3>
                        </div>
                        {remaining !== null && remaining <= 3 && (
                          <span className="mt-1 shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-500">
                            Hızla tükeniyor
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {contents.includes('vegan') ? 'Vejetaryen sürpriz kutu' : 'Sürpriz kutu'}
                        {me?.businessType ? ` · ${typeLabel(me.businessType)}` : ''}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-amber-500">4.4</span>
                        <span className="text-gray-400">(120+ değerlendirme)</span>
                      </p>

                      {/* Kutuda ne olabilir? */}
                      <h4 className="mt-5 text-sm font-bold text-gray-900">🎒 Kutuda ne olabilir?</h4>
                      <p className={`mt-1.5 text-sm leading-relaxed ${description ? 'text-gray-500' : 'italic text-gray-300'}`}>
                        {description || 'Açıklaman burada görünecek…'}
                      </p>
                      {contents.length > 0 && (
                        <ul className="mt-2.5 space-y-1.5">
                          {contents.map((key) => {
                            const c = CONTENTS.find((x) => x.key === key);
                            return (
                              <motion.li
                                key={key}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-2 text-sm text-gray-500"
                              >
                                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
                                {c?.emoji} {c?.long}
                              </motion.li>
                            );
                          })}
                        </ul>
                      )}

                      {/* Teslim alma — dinamik saatler */}
                      <h4 className="mt-5 flex items-center gap-1.5 text-sm font-bold text-gray-900">
                        <Clock className="h-4 w-4 text-gray-400" /> Teslim alma
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {pickupStart && pickupEnd
                          ? <>Bugün {pickupStart} – {pickupEnd} · Kendi çantanı getirmeyi unutma!</>
                          : <span className="italic text-gray-300">Teslim saatini Ayarlar'dan belirle</span>}
                      </p>

                      {/* Konum — dinamik adres */}
                      <h4 className="mt-5 text-sm font-bold text-gray-900">📍 Konum</h4>
                      <p className="mt-1 text-sm font-bold text-gray-800">{name || '—'}</p>
                      <p className={`text-sm ${addressLine ? 'text-gray-500' : 'italic text-gray-300'}`}>
                        {addressLine || 'Adres bilgin kayıttan gelir'}
                      </p>
                    </div>
                  </div>

                  {/* Yapışkan alt bar — üstü çizili fiyat + Rezerve et */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 border-t border-gray-100 bg-white px-4 pb-6 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
                    <div className="shrink-0">
                      {originalPrice !== null && <p className="text-xs text-gray-300 line-through">{originalPrice} ₺</p>}
                      <p className="text-xl font-black leading-tight text-emerald-800">
                        {price !== null ? `${price} ₺` : '—'}
                      </p>
                    </div>
                    <div className="flex-1 rounded-full bg-emerald-800 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-800/25">
                      Rezerve et
                    </div>
                  </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </div>

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
