// Kullanıcı giriş/kayıt — tek ekran, sekmeyle geçiş. KVKK onayı kayıtta zorunlu.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, UserRound, Phone, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiErrorMessage } from '../../services/api';
import * as userService from '../../services/userService';
import { GlassCard } from '../../components/admin/AdminUI';

const inputWrap = `flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5
  transition-all duration-300 ease-in-out focus-within:border-emerald-400/50 focus-within:bg-white/[0.07]
  focus-within:ring-2 focus-within:ring-emerald-500/40`;

export default function UserAuth() {
  const navigate = useNavigate();
  const { login } = useAuth('user');
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', kvkk: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'register') {
        await userService.register({
          name: form.name,
          email: form.email,
          ...(form.phone ? { phone: form.phone } : {}),
          password: form.password,
          kvkkConsent: form.kvkk,
        });
      }
      await login({ email: form.email, password: form.password });
      navigate('/app', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'İşlem başarısız.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-4">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {mode === 'login' ? 'Tekrar hoş geldin 👋' : 'Aramıza katıl 🌱'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === 'login' ? 'Sürpriz kutular seni bekliyor' : 'Yemeği kurtar, yarı fiyatına ye'}
        </p>
      </div>

      {/* Mod geçişi */}
      <div className="relative mx-auto mb-6 flex w-fit rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
        {['login', 'register'].map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(''); }}
            className="relative rounded-lg px-5 py-1.5 text-xs font-semibold transition-colors duration-300"
          >
            {mode === m && (
              <motion.span
                layoutId="auth-mode-pill"
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                className="absolute inset-0 rounded-lg bg-emerald-500/[0.16] ring-1 ring-inset ring-emerald-400/25"
              />
            )}
            <span className={`relative z-10 ${mode === m ? 'text-emerald-300' : 'text-slate-500'}`}>
              {m === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </span>
          </button>
        ))}
      </div>

      <GlassCard className="p-6">
        <form onSubmit={submit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div className={inputWrap}>
                <UserRound className="h-4 w-4 shrink-0 text-slate-500" />
                <input required value={form.name} onChange={set('name')} placeholder="Ad Soyad"
                  className="w-full bg-transparent py-3 text-sm text-white placeholder-slate-600 outline-none" />
              </div>
              <div className={inputWrap}>
                <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                <input value={form.phone} onChange={set('phone')} placeholder="Telefon (isteğe bağlı)"
                  className="w-full bg-transparent py-3 text-sm text-white placeholder-slate-600 outline-none" />
              </div>
            </>
          )}

          <div className={inputWrap}>
            <Mail className="h-4 w-4 shrink-0 text-slate-500" />
            <input type="email" required autoComplete="username" value={form.email} onChange={set('email')}
              placeholder="E-posta" className="w-full bg-transparent py-3 text-sm text-white placeholder-slate-600 outline-none" />
          </div>
          <div className={inputWrap}>
            <Lock className="h-4 w-4 shrink-0 text-slate-500" />
            <input type="password" required value={form.password} onChange={set('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder={mode === 'login' ? 'Şifre' : 'Şifre (en az 8 karakter)'}
              className="w-full bg-transparent py-3 text-sm text-white placeholder-slate-600 outline-none" />
          </div>

          {mode === 'register' && (
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5">
              <input type="checkbox" checked={form.kvkk} onChange={set('kvkk')}
                className="mt-0.5 h-4 w-4 accent-emerald-500" />
              <span className="text-[11px] leading-relaxed text-slate-400">
                <b className="text-slate-300">KVKK Aydınlatma Metni</b>'ni okudum; kişisel verilerimin
                sipariş ve bildirim süreçleri için işlenmesine açık rıza veriyorum.
              </span>
            </label>
          )}

          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300">
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={busy || (mode === 'register' && !form.kvkk)}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-emerald-950 shadow-[0_4px_24px_rgba(16,185,129,0.4)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-95 active:duration-100 disabled:pointer-events-none disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
