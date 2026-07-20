// Müşteri giriş / kayıt — tek ekran, mod değiştirilebilir.
// Güvenlik: hata mesajları hesap varlığını ele vermez (backend "hatalı e-posta
// veya şifre" tek mesaj döner); KVKK onayı kayıt için zorunlu; giriş rate-limit
// arkasında. Başarıdan sonra ?redirect varsa oraya, yoksa keşfete döner.
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, User, Phone, Loader2, ArrowRight } from 'lucide-react';
import * as customerService from '../../services/customerService';
import { apiErrorMessage } from '../../services/api';

const inputWrap = 'flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 transition-all duration-300 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-500/10';
const inputCls = 'w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none';

export default function CustomerAuth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/kesfet';

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', kvkk: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !form.kvkk) {
      setError('Devam etmek için KVKK aydınlatma metnini onaylamalısınız.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'register') {
        await customerService.register({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          password: form.password,
          kvkkConsent: true,
        });
      } else {
        await customerService.login({ email: form.email.trim(), password: form.password });
      }
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'İşlem tamamlanamadı. Lütfen tekrar deneyin.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-600/20">
            <Leaf className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {mode === 'login' ? 'Tekrar hoş geldin' : 'Aramıza katıl'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'login' ? 'Fazla gıdayı kurtarmaya devam et.' : 'Uygun fiyata sürpriz kutuları keşfet.'}
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/60 sm:p-8">
          {/* Mod seçici */}
          <div className="mb-6 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
            {[{ k: 'login', l: 'Giriş Yap' }, { k: 'register', l: 'Kayıt Ol' }].map((t) => (
              <button
                key={t.k}
                type="button"
                onClick={() => { setMode(t.k); setError(''); }}
                className="relative flex-1 rounded-lg py-2 text-sm font-semibold transition-colors duration-300"
              >
                {mode === t.k && (
                  <motion.span layoutId="auth-mode-pill" transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                    className="absolute inset-0 rounded-lg bg-emerald-600 shadow-sm shadow-emerald-600/25" />
                )}
                <span className={`relative z-10 ${mode === t.k ? 'text-white' : 'text-gray-500'}`}>{t.l}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === 'register' && (
              <div className={inputWrap}>
                <User className="h-4 w-4 shrink-0 text-gray-400" />
                <input value={form.name} onChange={set('name')} required minLength={2} placeholder="Ad Soyad" className={inputCls} />
              </div>
            )}
            <div className={inputWrap}>
              <Mail className="h-4 w-4 shrink-0 text-gray-400" />
              <input type="email" value={form.email} onChange={set('email')} required placeholder="E-posta" autoComplete="email" className={inputCls} />
            </div>
            {mode === 'register' && (
              <div className={inputWrap}>
                <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                <input value={form.phone} onChange={set('phone')} placeholder="Telefon (opsiyonel)" className={inputCls} />
              </div>
            )}
            <div className={inputWrap}>
              <Lock className="h-4 w-4 shrink-0 text-gray-400" />
              <input type="password" value={form.password} onChange={set('password')} required minLength={8}
                placeholder="Şifre (en az 8 karakter)" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className={inputCls} />
            </div>

            {mode === 'register' && (
              <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-relaxed text-gray-500">
                <input type="checkbox" checked={form.kvkk} onChange={(e) => setForm((f) => ({ ...f, kvkk: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                <span><b className="font-semibold text-gray-700">KVKK aydınlatma metnini</b> okudum, kişisel verilerimin işlenmesini onaylıyorum.</span>
              </label>
            )}

            {error && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-600">
                {error}
              </motion.p>
            )}

            <button type="submit" disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl active:scale-95 disabled:pointer-events-none disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'} <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          İşletme misin? <Link to="/business" className="font-semibold text-emerald-600 hover:underline">İşletme paneline geç</Link>
        </p>
      </motion.div>
    </div>
  );
}
