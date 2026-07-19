// Genel Bakış — platformun nabzı: canlı metrikler, 30 günlük sipariş/gelir
// trendi ve acil müdahale alarmları. Tema: aydınlık (işletme paneliyle aynı).
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, Store, Package, Wallet, TrendingUp, Hourglass,
  AlertTriangle, Info, ArrowRight, RefreshCw, Siren, Settings, Save, Loader2
} from 'lucide-react';
import * as adminService from '../../services/adminService';
import { apiErrorMessage } from '../../services/api';
import { LightCard, Spinner, GhostButton, useToasts, ToastStack } from '../../components/admin/AdminUI';

const tl = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 });

// Son N günü doldur (satış olmayan günler grafikte 0 görünsün)
function fillDays(daily, days) {
  const byDate = Object.fromEntries((daily || []).map((d) => [d.date, d]));
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' }).format(d);
    out.push({
      date: key,
      label: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      revenue: byDate[key]?.revenue || 0,
      orders: byDate[key]?.orders || 0,
    });
  }
  return out;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs shadow-lg">
      <p className="font-bold text-gray-900">{label}</p>
      <p className="mt-1 text-emerald-600">{tl.format(p.revenue)} ciro</p>
      <p className="text-gray-500">{p.orders} sipariş</p>
    </div>
  );
}

const ALARM_STYLES = {
  danger:  { icon: Siren,         cls: 'border-rose-200 bg-rose-50 text-rose-700',    iconCls: 'text-rose-500' },
  warning: { icon: AlertTriangle, cls: 'border-amber-200 bg-amber-50 text-amber-700', iconCls: 'text-amber-500' },
  info:    { icon: Info,          cls: 'border-sky-200 bg-sky-50 text-sky-700',       iconCls: 'text-sky-500' },
};

function MetricCard({ icon: Icon, label, value, sub, tone = 'text-emerald-600', bg = 'bg-emerald-50' }) {
  return (
    <LightCard interactive className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
          <p className="mt-1.5 text-2xl font-black text-gray-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <span className={`rounded-xl p-2.5 ${bg} ${tone}`}><Icon className="h-5 w-5" /></span>
      </div>
    </LightCard>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toasts, push } = useToasts();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Platform settings state
  const [markupRate, setMarkupRate] = useState(null);
  const [markupInput, setMarkupInput] = useState('');
  const [markupSaving, setMarkupSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, settingsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getPlatformSettings().catch(() => ({ data: { markupRate: 10 } }))
      ]);
      setData(dashRes);
      const rate = settingsRes.data?.markupRate ?? 10;
      setMarkupRate(rate);
      setMarkupInput(String(rate));
    } catch (err) {
      push(apiErrorMessage(err, 'Panel verisi yüklenemedi.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  const saveMarkupRate = async () => {
    const val = parseFloat(markupInput);
    if (isNaN(val) || val < 0 || val > 100) return;
    setMarkupSaving(true);
    try {
      await adminService.updatePlatformSettings(val);
      setMarkupRate(val);
      push('Platform farkı güncellendi.', 'success');
    } catch { 
      push('Güncelleme başarısız.', 'error'); 
    } finally { 
      setMarkupSaving(false); 
    }
  };

  useEffect(() => { load(); }, [load]);

  if (loading || !data) {
    return <LightCard><div className="flex justify-center py-24"><Spinner className="h-8 w-8" /></div></LightCard>;
  }

  const m = data.metrics;
  const chart = fillDays(data.daily, 30);

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Genel Bakış</h1>
          <p className="mt-1 text-sm text-gray-500">Platformun canlı durumu — bugün ve son 30 gün</p>
        </div>
        <GhostButton onClick={load} className="p-2.5" title="Yenile">
          <RefreshCw className="h-4 w-4" />
        </GhostButton>
      </div>

      {/* Platform Ayarları */}
      <LightCard className="mb-6 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-bold text-gray-900">Platform Farkı (Markup)</span>
          </div>
          <p className="flex-1 text-xs text-gray-500">
            İşletme fiyatına eklenen platform payı. Değiştirildiğinde yeni açılan tüm kutulara uygulanır.
          </p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="number" min="0" max="100" step="0.5"
                value={markupInput}
                onChange={(e) => setMarkupInput(e.target.value)}
                className="w-24 rounded-lg border border-gray-200 py-2 pl-3 pr-7 text-sm font-semibold text-gray-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
            </div>
            <button
              onClick={saveMarkupRate}
              disabled={markupSaving || markupInput === String(markupRate)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {markupSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Kaydet
            </button>
            {markupRate !== null && (
              <span className="ml-2 hidden text-xs text-gray-400 sm:inline">
                Aktif: <strong className="text-emerald-600">%{markupRate}</strong> (ör. 100₺ → {Math.round(100 * (1 + markupRate/100))}₺)
              </span>
            )}
          </div>
        </div>
      </LightCard>

      {/* Canlı metrikler */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Toplam Kullanıcı" value={m.totalUsers.toLocaleString('tr-TR')}
          tone="text-indigo-600" bg="bg-indigo-50" />
        <MetricCard icon={Store} label="Aktif İşletme" value={m.activeBusinesses.toLocaleString('tr-TR')}
          sub={m.pendingBusinesses > 0 ? `${m.pendingBusinesses} onay bekliyor` : 'Onay kuyruğu boş'} />
        <MetricCard icon={Package} label="Bugün Satılan Kutu" value={m.todaySold.toLocaleString('tr-TR')}
          sub={`${m.todayBoxes} işletme bugün kutu yayınladı`} tone="text-amber-600" bg="bg-amber-50" />
        <MetricCard icon={Wallet} label="Bugünkü Ciro" value={tl.format(m.todayRevenue)}
          sub={`Toplam: ${tl.format(m.totalRevenue)}`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_22rem]">
        {/* 30 günlük trend */}
        <LightCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Son 30 Gün — Sipariş & Gelir
            </h2>
            <p className="text-xs text-gray-400">yalnızca ödenen/teslim edilen siparişler</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="transparent" interval={4}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} tickMargin={10} />
                <YAxis stroke="transparent" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${v}₺`} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(16,185,129,0.25)', strokeWidth: 1.5 }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5}
                  fill="url(#dashRevGrad)" activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </LightCard>

        {/* Alarmlar + hızlı durum */}
        <div className="space-y-5">
          <LightCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <Siren className="h-4 w-4 text-rose-500" /> Alarmlar
            </h2>
            {data.alarms.length === 0 ? (
              <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
                Her şey yolunda — müdahale gerektiren durum yok. 🎉
              </p>
            ) : (
              <div className="space-y-2.5">
                {data.alarms.map((a, i) => {
                  const s = ALARM_STYLES[a.level] || ALARM_STYLES.info;
                  return (
                    <motion.button
                      key={`${a.text}-${i}`}
                      type="button"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: i * 0.06 } }}
                      onClick={() => a.link && navigate(`/admin/panel/${a.link}`)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-xs font-semibold transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${s.cls}`}
                    >
                      <s.icon className={`h-4 w-4 shrink-0 ${s.iconCls}`} />
                      <span className="flex-1">{a.text}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </LightCard>

          <LightCard className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <Hourglass className="h-4 w-4 text-indigo-500" /> Anlık Akış
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Aktif rezervasyon (ödeme bekliyor)</span>
                <span className="font-bold text-gray-900">{m.activeReservations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Son 24 saatte iade</span>
                <span className={`font-bold ${m.refunds24h >= 3 ? 'text-rose-600' : 'text-gray-900'}`}>{m.refunds24h}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Bugün yayınlanan kutu</span>
                <span className="font-bold text-gray-900">{m.todayBoxes}</span>
              </div>
            </div>
          </LightCard>
        </div>
      </div>
    </div>
  );
}
