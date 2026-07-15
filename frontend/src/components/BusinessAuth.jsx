import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { turkeyZones } from '../data/turkey_zones';
import { motion, AnimatePresence } from 'framer-motion';

function LogoIcon({ className }) {
  return (
    <svg viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Right branch stem */}
      <path d="M 45 42 Q 65 42 85 25" />
      {/* Right branch leaves */}
      <path d="M 55 40 Q 52 30 63 24 Q 61 35 55 40 Z" />
      <path d="M 68 35 Q 65 24 77 18 Q 75 28 68 35 Z" />
      <path d="M 80 28 Q 80 18 92 18 Q 88 28 80 28 Z" />
      <path d="M 58 41 Q 65 48 72 45 Q 65 38 58 41 Z" />
      <path d="M 70 34 Q 78 40 85 38 Q 77 32 70 34 Z" />
      {/* Right branch berries */}
      <path d="M 62 38 L 65 23" />
      <circle cx="65" cy="23" r="2" fill="currentColor" />
      <path d="M 73 31 L 77 16" />
      <circle cx="77" cy="16" r="2" fill="currentColor" />
      <path d="M 82 27 L 87 12" />
      <circle cx="87" cy="12" r="2" fill="currentColor" />

      {/* Left branch stem */}
      <path d="M 55 40 Q 35 38 15 55" />
      {/* Left branch leaves */}
      <path d="M 45 40 Q 48 50 37 56 Q 39 45 45 40 Z" />
      <path d="M 32 45 Q 35 56 23 62 Q 25 52 32 45 Z" />
      <path d="M 20 52 Q 20 62 8 62 Q 12 52 20 52 Z" />
      <path d="M 42 39 Q 35 32 28 35 Q 35 42 42 39 Z" />
      <path d="M 30 46 Q 22 40 15 42 Q 23 48 30 46 Z" />
      {/* Left branch berries */}
      <path d="M 38 42 L 35 57" />
      <circle cx="35" cy="57" r="2" fill="currentColor" />
      <path d="M 27 49 L 23 64" />
      <circle cx="23" cy="64" r="2" fill="currentColor" />
      <path d="M 18 53 L 13 68" />
      <circle cx="13" cy="68" r="2" fill="currentColor" />
    </svg>
  );
}
import {
  Store, FileText, Package, Lock, Check, ChevronLeft, ChevronRight,
  UtensilsCrossed, Croissant, ShoppingCart, Coffee, Carrot, Beef, Hotel,
  Building2, Wheat, Soup, Salad, Leaf, Clock, ShieldCheck,
} from 'lucide-react';

// ---------------------------------------------------------------
// Adım tanımları ve seçim kartı verileri
// ---------------------------------------------------------------
const STEPS = [
  { title: 'İşletme Profili', icon: Store },
  { title: 'Yasal & İletişim', icon: FileText },
  { title: 'Kurtarma Ayarları', icon: Package },
  { title: 'Hesap Güvenliği', icon: Lock },
];

const BUSINESS_TYPES = [
  { value: 'restoran', label: 'Restoran', icon: UtensilsCrossed },
  { value: 'firin', label: 'Fırın / Pastane', icon: Croissant },
  { value: 'market', label: 'Süpermarket', icon: ShoppingCart },
  { value: 'kafe', label: 'Kafe', icon: Coffee },
  { value: 'manav', label: 'Manav', icon: Carrot },
  { value: 'kasap', label: 'Kasap', icon: Beef },
  { value: 'otel', label: 'Otel', icon: Hotel },
];

const BRANCH_TYPES = [
  { value: 'tek', label: 'Tek Şube', desc: 'Tek noktadan hizmet veriyorum', icon: Store },
  { value: 'zincir', label: 'Zincir', desc: 'Birden fazla şubem var', icon: Building2 },
];

const CONTACT_ROLES = [
  { value: 'sahibi', label: 'İşletme Sahibi' },
  { value: 'mudur', label: 'Mağaza Müdürü' },
  { value: 'operasyon', label: 'Operasyon Sorumlusu' },
  { value: 'diger', label: 'Diğer' },
];

const BOX_COUNTS = ['1-2', '3-5', '6-10', '10+'];

const BOX_CONTENTS = [
  { value: 'unlu', label: 'Unlu Mamuller', icon: Wheat },
  { value: 'sicak', label: 'Sıcak Yemek', icon: Soup },
  { value: 'meze', label: 'Meze / Salata', icon: Salad },
  { value: 'manav', label: 'Manav / Sebze', icon: Carrot },
  { value: 'karisik', label: 'Karışık Kutu', icon: Package },
  { value: 'vegan', label: 'Vegan / Vejetaryen', icon: Leaf },
];

const inputCls = 'appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm transition-colors bg-white';
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

function Field({ label, hint, children }) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {hint && <span className="ml-1.5 font-normal text-gray-400 text-xs">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export default function BusinessAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [stepError, setStepError] = useState(null);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.mode === 'register') {
      setIsLogin(false);
      setStep(0);
    } else if (location.state?.mode === 'login') {
      setIsLogin(true);
    }
  }, [location.state]);

  const [formData, setFormData] = useState({
    // Adım 1 — İşletme profili
    name: '',
    businessType: '',
    branchType: 'tek',
    // Adım 2 — Yasal & iletişim
    legalName: '',
    taxOffice: '',
    taxNumber: '',
    mersisNumber: '',
    city: '',
    district: '',
    neighborhood: '',
    address: '',
    phone: '',
    contactName: '',
    contactRole: 'sahibi',
    contactPhone: '',
    // Adım 3 — Kurtarma ayarları
    dailyBoxCount: '3-5',
    boxContents: [],
    pickupStart: '18:00',
    pickupEnd: '21:00',
    // Adım 4 — Hesap
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const set = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setStepError(null);
  };

  const handleChange = (e) => set(e.target.name, e.target.value);

  const toggleBoxContent = (value) => {
    setFormData((prev) => ({
      ...prev,
      boxContents: prev.boxContents.includes(value)
        ? prev.boxContents.filter((v) => v !== value)
        : [...prev.boxContents, value],
    }));
    setStepError(null);
  };

  // Her adımın zorunlu alan kontrolü
  const validateStep = (s) => {
    if (s === 0) {
      if (!formData.name.trim()) return 'İşletme adını girin.';
      if (!formData.businessType) return 'İşletme türünü seçin.';
    }
    if (s === 1) {
      if (!formData.legalName.trim()) return 'Resmi şirket unvanını girin.';
      if (!formData.taxOffice.trim() || !formData.taxNumber.trim()) return 'Vergi dairesi ve vergi numarası zorunludur.';
      if (!formData.city.trim() || !formData.district.trim()) return 'Şehir ve ilçe bilgisini girin.';
      if (!formData.address.trim()) return 'Tam adresi girin.';
      if (!formData.phone.trim()) return 'İşletme telefonunu girin.';
      if (!formData.contactName.trim()) return 'Yetkili adı-soyadını girin.';
      if (!formData.contactPhone.trim()) return 'Yetkili cep telefonunu girin.';
    }
    if (s === 2) {
      if (formData.boxContents.length === 0) return 'En az bir kutu içeriği seçin.';
      if (!formData.pickupStart || !formData.pickupEnd) return 'Teslim alım saat aralığını belirleyin.';
      if (formData.pickupEnd <= formData.pickupStart) return 'Bitiş saati başlangıçtan sonra olmalı.';
    }
    if (s === 3) {
      if (!formData.email.trim()) return 'E-posta adresinizi girin.';
      if (formData.password.length < 8) return 'Şifre en az 8 karakter olmalı.';
      if (formData.password !== formData.passwordConfirm) return 'Şifreler eşleşmiyor.';
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) { setStepError(err); return; }
    setDirection(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async (payload, endpoint) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.status === 'success') {
        setMessage({ type: 'success', text: isLogin ? 'Sisteme başarıyla giriş yapıldı!' : 'İşletme kaydınız oluşturuldu! Hoş geldiniz 🎉' });
        if (data.token) localStorage.setItem('token', data.token);
      } else {
        setMessage({ type: 'error', text: data.message || 'Bir hata oluştu. Lütfen tekrar deneyin.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    submit({ email: formData.email, password: formData.password }, '/api/v1/business/login');
  };

  const handleRegisterSubmit = () => {
    const err = validateStep(3);
    if (err) { setStepError(err); return; }
    const { passwordConfirm, ...payload } = formData;
    submit(payload, '/api/v1/business/register');
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setMessage(null);
    setStepError(null);
    setStep(0);
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="min-h-[85vh] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link to="/" className="flex items-center justify-center text-brand hover:opacity-90 transition-opacity mb-2" aria-label="Anasayfa">
          <LogoIcon className="h-12 w-auto" />
        </Link>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {isLogin ? 'İşletme Hesabınıza Giriş Yapın' : 'İşletmenizi Kaydedin'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Fazla gıdaları gelire dönüştürün, çevreyi koruyun.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-10 px-6 shadow-xl rounded-3xl sm:px-10 border border-gray-100">

          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
              {message.text}
            </div>
          )}

          {/* ------------------- GİRİŞ ------------------- */}
          {isLogin ? (
            <form className="space-y-6 max-w-md mx-auto" onSubmit={handleLoginSubmit}>
              <Field label="E-posta Adresi">
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="Şifre">
                <input name="password" type="password" required value={formData.password} onChange={handleChange} className={inputCls} />
              </Field>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition duration-300 disabled:opacity-70">
                {loading ? 'İşleniyor...' : 'Giriş Yap'}
              </button>
            </form>
          ) : (
            <>
              {/* ------------- İLERLEME ÇUBUĞU ------------- */}
              <div className="mb-10">
                <div className="flex items-center justify-between relative">
                  {/* Arka çizgi + dolan çizgi */}
                  <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 mx-10"></div>
                  <motion.div
                    className="absolute left-0 top-5 h-0.5 bg-brand mx-10 origin-left"
                    style={{ right: '2.5rem' }}
                    initial={false}
                    animate={{ scaleX: step / (STEPS.length - 1) }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  ></motion.div>

                  {STEPS.map((s, i) => {
                    const done = i < step;
                    const active = i === step;
                    return (
                      <div key={s.title} className="relative z-10 flex flex-col items-center flex-1">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          done ? 'bg-brand border-brand text-white'
                          : active ? 'bg-white border-brand text-brand ring-4 ring-brand/15'
                          : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                          {done ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                        </div>
                        <span className={`mt-2 text-[11px] font-semibold text-center hidden sm:block ${active || done ? 'text-brand-dark' : 'text-gray-400'}`}>
                          {s.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ------------- ADIM İÇERİKLERİ ------------- */}
              <div className="overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="space-y-6"
                  >
                    {/* ===== ADIM 1: İşletme Profili ===== */}
                    {step === 0 && (
                      <>
                        <Field label="İşletme Adı" hint="(müşterilerin haritada göreceği tabela adı)">
                          <input name="name" type="text" placeholder="örn: Manolya Cafe" value={formData.name} onChange={handleChange} className={inputCls} />
                        </Field>

                        <Field label="İşletme Türü">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {BUSINESS_TYPES.map((t) => (
                              <button
                                key={t.value}
                                type="button"
                                onClick={() => set('businessType', t.value)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                                  formData.businessType === t.value
                                    ? 'border-brand bg-brand-light/60 text-brand-dark shadow-sm'
                                    : 'border-gray-200 text-gray-500 hover:border-brand/40 hover:bg-gray-50'
                                }`}
                              >
                                <t.icon className="h-6 w-6" />
                                <span className="text-xs font-semibold text-center leading-tight">{t.label}</span>
                              </button>
                            ))}
                          </div>
                        </Field>

                        <Field label="Şube Yapısı">
                          <div className="grid grid-cols-2 gap-3">
                            {BRANCH_TYPES.map((b) => (
                              <button
                                key={b.value}
                                type="button"
                                onClick={() => set('branchType', b.value)}
                                className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                                  formData.branchType === b.value
                                    ? 'border-brand bg-brand-light/60 shadow-sm'
                                    : 'border-gray-200 hover:border-brand/40 hover:bg-gray-50'
                                }`}
                              >
                                <b.icon className={`h-5 w-5 mt-0.5 flex-none ${formData.branchType === b.value ? 'text-brand-dark' : 'text-gray-400'}`} />
                                <span>
                                  <span className={`block text-sm font-bold ${formData.branchType === b.value ? 'text-brand-dark' : 'text-gray-700'}`}>{b.label}</span>
                                  <span className="block text-xs text-gray-500 mt-0.5">{b.desc}</span>
                                </span>
                              </button>
                            ))}
                          </div>
                        </Field>
                      </>
                    )}

                    {/* ===== ADIM 2: Yasal & İletişim ===== */}
                    {step === 1 && (
                      <>
                        <Field label="Resmi Şirket Unvanı" hint="(fatura ve sözleşmeler için)">
                          <input name="legalName" type="text" placeholder="örn: Manolya Gıda Tic. Ltd. Şti." value={formData.legalName} onChange={handleChange} className={inputCls} />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field label="Vergi Dairesi">
                            <input name="taxOffice" type="text" value={formData.taxOffice} onChange={handleChange} className={inputCls} />
                          </Field>
                          <Field label="Vergi No (VKN/TCKN)">
                            <input name="taxNumber" type="text" inputMode="numeric" value={formData.taxNumber} onChange={handleChange} className={inputCls} />
                          </Field>
                        </div>

                        <Field label="Mersis No / Ticaret Sicil No" hint="(opsiyonel — güvenilirliği artırır)">
                          <input name="mersisNumber" type="text" value={formData.mersisNumber} onChange={handleChange} className={inputCls} />
                        </Field>

                        <div className="border-t border-gray-100 pt-5">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field label="Şehir">
                              <select
                                name="city"
                                value={formData.city}
                                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value, district: '', neighborhood: '' }))}
                                className={inputCls}
                              >
                                <option value="">Seçiniz</option>
                                {Object.keys(turkeyZones).map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </Field>
                            <Field label="İlçe">
                              <select
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                disabled={!formData.city}
                                className={inputCls}
                              >
                                <option value="">Seçiniz</option>
                                {formData.city && turkeyZones[formData.city].map((d) => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </Field>
                            <Field label="Mahalle">
                              <input name="neighborhood" type="text" placeholder="örn: Caferağa" value={formData.neighborhood} onChange={handleChange} className={inputCls} />
                            </Field>
                          </div>
                          <div className="mt-4">
                            <Field label="Tam Adres" hint="(harita pin'i kayıt sonrası panelden doğrulanır)">
                              <textarea name="address" rows="2" value={formData.address} onChange={handleChange} className={`${inputCls} resize-none`}></textarea>
                            </Field>
                          </div>
                          <div className="mt-4">
                            <Field label="İşletme Telefonu">
                              <input name="phone" type="tel" placeholder="0(212) ..." value={formData.phone} onChange={handleChange} className={inputCls} />
                            </Field>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-5">
                          <p className="text-sm font-bold text-gray-900 mb-4">Yetkili Kişi</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Adı Soyadı">
                              <input name="contactName" type="text" value={formData.contactName} onChange={handleChange} className={inputCls} />
                            </Field>
                            <Field label="Görevi">
                              <select name="contactRole" value={formData.contactRole} onChange={handleChange} className={inputCls}>
                                {CONTACT_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                              </select>
                            </Field>
                          </div>
                          <div className="mt-4">
                            <Field label="Yetkili Cep Telefonu" hint="(bildirimler için)">
                              <input name="contactPhone" type="tel" placeholder="05..." value={formData.contactPhone} onChange={handleChange} className={inputCls} />
                            </Field>
                          </div>
                        </div>
                      </>
                    )}

                    {/* ===== ADIM 3: Kurtarma Ayarları ===== */}
                    {step === 2 && (
                      <>
                        <Field label="Tahmini Günlük Sürpriz Kutu Sayısı">
                          <div className="grid grid-cols-4 gap-3">
                            {BOX_COUNTS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => set('dailyBoxCount', c)}
                                className={`py-3.5 rounded-2xl border-2 text-sm font-bold transition-all duration-200 ${
                                  formData.dailyBoxCount === c
                                    ? 'border-brand bg-brand text-white shadow-md'
                                    : 'border-gray-200 text-gray-600 hover:border-brand/40'
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </Field>

                        <Field label="Tercih Edilen Kutu İçeriği" hint="(birden fazla seçebilirsiniz)">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {BOX_CONTENTS.map((c) => {
                              const selected = formData.boxContents.includes(c.value);
                              return (
                                <button
                                  key={c.value}
                                  type="button"
                                  onClick={() => toggleBoxContent(c.value)}
                                  className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                                    selected
                                      ? 'border-brand bg-brand-light/60 text-brand-dark shadow-sm'
                                      : 'border-gray-200 text-gray-500 hover:border-brand/40 hover:bg-gray-50'
                                  }`}
                                >
                                  {selected && (
                                    <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-brand text-white flex items-center justify-center">
                                      <Check className="h-3 w-3" />
                                    </span>
                                  )}
                                  <c.icon className="h-6 w-6" />
                                  <span className="text-xs font-semibold text-center leading-tight">{c.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </Field>

                        <Field label="Kutu Teslim Alım Saat Aralığı" hint="(müşteriler bu saatlerde gelip alır)">
                          <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-2xl p-4">
                            <Clock className="h-5 w-5 text-brand flex-none" />
                            <input name="pickupStart" type="time" value={formData.pickupStart} onChange={handleChange} className={`${inputCls} !w-auto`} />
                            <span className="text-gray-400 font-medium">—</span>
                            <input name="pickupEnd" type="time" value={formData.pickupEnd} onChange={handleChange} className={`${inputCls} !w-auto`} />
                          </div>
                          <p className="mt-2 text-xs text-gray-400">İşletmeler gıda fazlasını genellikle gün sonuna doğru çıkarır — örn. 18:30-19:30 veya 21:00-22:00.</p>
                        </Field>
                      </>
                    )}

                    {/* ===== ADIM 4: Hesap Güvenliği ===== */}
                    {step === 3 && (
                      <>
                        <div className="flex items-center gap-3 bg-brand-light/50 border border-brand/20 rounded-2xl p-4">
                          <ShieldCheck className="h-6 w-6 text-brand flex-none" />
                          <p className="text-sm text-brand-dark">
                            Son adım! <b>{formData.name || 'İşletmeniz'}</b> için giriş bilgilerinizi oluşturun.
                          </p>
                        </div>

                        <Field label="Yetkili E-posta Adresi" hint="(giriş için kullanılacak)">
                          <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputCls} />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field label="Şifre" hint="(en az 8 karakter)">
                            <input name="password" type="password" value={formData.password} onChange={handleChange} className={inputCls} />
                          </Field>
                          <Field label="Şifre (Tekrar)">
                            <input name="passwordConfirm" type="password" value={formData.passwordConfirm} onChange={handleChange} className={inputCls} />
                          </Field>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {stepError && (
                <p className="mt-5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{stepError}</p>
              )}

              {/* ------------- İLERİ / GERİ ------------- */}
              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? (
                  <button type="button" onClick={goBack} className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                    <ChevronLeft className="h-4 w-4" /> Geri
                  </button>
                ) : <span></span>}

                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={goNext} className="flex items-center gap-1.5 px-7 py-3 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-dark transition shadow-md">
                    Devam Et <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="button" onClick={handleRegisterSubmit} disabled={loading} className="flex items-center gap-1.5 px-7 py-3 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-dark transition shadow-md disabled:opacity-70">
                    {loading ? 'Kaydediliyor...' : 'Kaydı Tamamla'} <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          )}

          {/* ------------- MOD DEĞİŞTİRME ------------- */}
          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <button onClick={switchMode} className="font-medium text-brand hover:text-brand-dark text-sm transition-colors">
              {isLogin ? 'İşletmenizi henüz kaydetmediniz mi? Hemen kayıt olun.' : 'Zaten bir hesabınız var mı? Buradan giriş yapın.'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
