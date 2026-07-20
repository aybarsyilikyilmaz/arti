// Profil — hesap özeti + kısayollar + çıkış. Girişsizse login'e yönlendirir.
import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Heart, ShoppingBag, LogOut, Loader2, ChevronRight, CalendarDays } from 'lucide-react';
import * as customerService from '../../services/customerService';
import { logout as apiLogout } from '../../services/api';
import { apiErrorMessage } from '../../services/api';

export default function Profile() {
  const { authed } = useOutletContext();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authed) { navigate('/kesfet/giris?redirect=/kesfet/profil'); return; }
    customerService.getMe()
      .then(setMe)
      .catch((err) => setError(apiErrorMessage(err, 'Profil yüklenemedi.')))
      .finally(() => setLoading(false));
  }, [authed, navigate]);

  const handleLogout = async () => {
    await apiLogout();
    navigate('/kesfet');
  };

  if (!authed) return null;
  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="mx-auto max-w-lg">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Başlık kartı */}
        <div className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-black text-white shadow-lg shadow-emerald-600/20">
            {(me?.name || '?').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-gray-900">{me?.name}</h1>
            <p className="truncate text-sm text-gray-500">{me?.email}</p>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600">{error}</p>}

        {/* Bilgiler */}
        <div className="mt-4 space-y-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <Row icon={Mail} label="E-posta" value={me?.email} />
          <Row icon={Phone} label="Telefon" value={me?.phone || 'Belirtilmemiş'} />
          <Row icon={Heart} label="Favori işletme" value={`${me?.favoriteCount ?? 0} işletme`} />
          <Row icon={CalendarDays} label="Üyelik"
            value={me?.createdAt ? new Date(me.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
        </div>

        {/* Kısayollar */}
        <div className="mt-4 space-y-2">
          <Shortcut icon={ShoppingBag} label="Siparişlerim" onClick={() => navigate('/kesfet/siparislerim')} />
          <Shortcut icon={Heart} label="Favorilerim" onClick={() => navigate('/kesfet/favoriler')} />
        </div>

        <button onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95">
          <LogOut className="h-4 w-4" /> Çıkış Yap
        </button>
      </motion.div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</span>
      <span className="ml-auto truncate text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function Shortcut({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
      <Icon className="h-[18px] w-[18px] text-emerald-600" /> {label}
      <ChevronRight className="ml-auto h-4 w-4 text-gray-300" />
    </button>
  );
}
