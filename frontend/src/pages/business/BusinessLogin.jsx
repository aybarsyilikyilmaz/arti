// İşletme paneli girişi — admin ile aynı tasarım dili, zümrüt vurgu.
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiErrorMessage } from '../../services/api';
import { AdminBackdrop, GlassCard } from '../../components/admin/AdminUI';

export default function BusinessLogin() {
  const navigate = useNavigate();
  const { authed, restoring, login } = useAuth('business');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!restoring && authed) navigate('/panel/genel-bakis', { replace: true });
  }, [authed, restoring, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form);
      navigate('/panel/genel-bakis', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Giriş yapılamadı.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="font-admin relative flex min-h-screen items-center justify-center px-4 text-slate-200 antialiased">
      <AdminBackdrop />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <GlassCard className="p-8 sm:p-10">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/50 blur-xl" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <Store className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Artı<span className="text-emerald-400">+</span> İşletme Paneli
              </h1>
              <p className="mt-1 text-sm text-slate-500">Kutularını yönet, satışlarını takip et</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">E-posta</span>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 transition-all duration-300 ease-in-out focus-within:border-emerald-400/50 focus-within:bg-white/[0.07] focus-within:ring-2 focus-within:ring-emerald-500/40">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                <input
                  type="email" required autoComplete="username"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="isletme@ornek.com"
                  className="w-full bg-transparent py-3 text-sm text-white placeholder-slate-600 outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">Şifre</span>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 transition-all duration-300 ease-in-out focus-within:border-emerald-400/50 focus-within:bg-white/[0.07] focus-within:ring-2 focus-within:ring-emerald-500/40">
                <Lock className="h-4 w-4 shrink-0 text-slate-500" />
                <input
                  type="password" required autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent py-3 text-sm text-white placeholder-slate-600 outline-none"
                />
              </div>
            </label>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit" disabled={busy}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-emerald-950 shadow-[0_4px_24px_rgba(16,185,129,0.4)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_10px_32px_rgba(16,185,129,0.55)] active:scale-95 active:duration-100 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  Panele Giriş
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Henüz başvurmadın mı?{' '}
            <Link to="/business" className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300">
              İşletme kaydı oluştur
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
