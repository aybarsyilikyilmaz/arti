// Admin giriş ekranı — koyu zümrüt zemin üzerinde cam kart.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiErrorMessage } from '../../services/api';
import { GlassCard } from '../../components/admin/AdminUI';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { authed, restoring, login } = useAuth('admin');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Cookie'den oturum kurtarıldıysa login ekranını hiç gösterme
  useEffect(() => {
    if (!restoring && authed) navigate('/admin/panel', { replace: true });
  }, [authed, restoring, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form);
      navigate('/admin/panel', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Giriş yapılamadı.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1f17] px-4">
      {/* Arka plan ışık lekeleri */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-emerald-400/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <GlassCard className="p-8 sm:p-10">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3">
              <ShieldCheck className="h-7 w-7 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Artı<span className="text-emerald-400">+</span> Yönetim
              </h1>
              <p className="mt-1 text-sm text-white/50">Yalnızca yetkili ekip üyeleri</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">E-posta</span>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 transition focus-within:border-emerald-400/50 focus-within:bg-white/[0.08]">
                <Mail className="h-4 w-4 shrink-0 text-white/30" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="ops@artiapp.com.tr"
                  className="w-full bg-transparent py-3 text-sm text-white placeholder-white/25 outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">Şifre</span>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 transition focus-within:border-emerald-400/50 focus-within:bg-white/[0.08]">
                <Lock className="h-4 w-4 shrink-0 text-white/30" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent py-3 text-sm text-white placeholder-white/25 outline-none"
                />
              </div>
            </label>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-300"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  Panele Giriş
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </GlassCard>

        <p className="mt-6 text-center text-xs text-white/25">
          Oturumlar 15 dakikada bir otomatik yenilenir · KVKK uyumlu erişim kaydı
        </p>
      </motion.div>
    </div>
  );
}
