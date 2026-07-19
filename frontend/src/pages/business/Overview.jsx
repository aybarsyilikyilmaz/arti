// Genel Bakış: bugünün kutu durumu + 7 günlük ciro grafiği + özet kartları.
// Veri kaynağı: GET /business/reports/summary (PLAN.md Faz 4 rapor ucu).
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Wallet, ShoppingBag, Leaf, Package, TrendingUp } from 'lucide-react';
import * as businessService from '../../services/businessService';
import { apiErrorMessage } from '../../services/api';
import { GlassCard, Spinner, useToasts, ToastStack } from '../../components/admin/AdminUI';

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
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a101f]/95 px-3.5 py-2.5 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,6,23,0.7)]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-emerald-400">{tl.format(p.revenue)}</p>
      <p className="text-xs text-slate-400">{p.orders} sipariş</p>
    </div>
  );
}

export default function Overview() {
  const { toasts, push } = useToasts();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    businessService.getSummary(7)
      .then(setData)
      .catch((err) => push(apiErrorMessage(err, 'Rapor yüklenemedi.'), 'error'))
      .finally(() => setLoading(false));
  }, [push]);

  if (loading) {
    return <GlassCard><div className="flex justify-center py-24"><Spinner className="h-7 w-7" /></div></GlassCard>;
  }
  if (!data) return null;

  const chart = fillDays(data.daily, 7);
  const paidOrders = (data.totals.byStatus?.PAID || 0) + (data.totals.byStatus?.PICKED_UP || 0);

  const stats = [
    { icon: Wallet, label: '7 Günlük Ciro', value: tl.format(data.totals.revenue), accent: 'emerald' },
    { icon: ShoppingBag, label: 'Ödenen Sipariş', value: paidOrders, accent: 'indigo' },
    { icon: Leaf, label: 'Kurtarılan Yemek', value: data.totals.rescuedBoxes, accent: 'emerald' },
    {
      icon: Package,
      label: 'Bugün Kalan Kutu',
      value: data.today.published ? data.today.remaining : '—',
      hint: data.today.published ? `${data.today.sold} satıldı` : 'Bugün kutu yayınlanmadı',
      accent: 'amber',
    },
  ];

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Genel Bakış</h1>
        <p className="mt-1 text-sm text-slate-500">Son 7 günün performansı ve bugünün durumu</p>
      </div>

      {/* İstatistik kartları */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
          >
            <GlassCard interactive className="p-5">
              <div className={`mb-3 inline-flex rounded-xl border p-2.5 ${
                s.accent === 'emerald' ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-400'
                : s.accent === 'indigo' ? 'border-indigo-400/20 bg-indigo-500/10 text-indigo-400'
                : 'border-amber-400/20 bg-amber-500/10 text-amber-400'
              }`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-white">{s.value}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{s.label}</p>
              {s.hint && <p className="mt-1 text-[11px] text-slate-600">{s.hint}</p>}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Ciro grafiği */}
      <GlassCard className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Günlük Ciro
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Yalnızca ödemesi tamamlanan siparişler</p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="transparent"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                tickMargin={10}
              />
              <YAxis
                stroke="transparent"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(16,185,129,0.25)', strokeWidth: 1.5 }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#34d399', stroke: 'rgba(16,185,129,0.3)', strokeWidth: 6 }}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
