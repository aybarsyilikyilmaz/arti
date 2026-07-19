// Genel Bakış: dinamik kontrol merkezi (Command Center).
// 4 istatistik kartı + bugünün kutu durumu + 7 günlük ciro grafiği + son siparişler akışı + puan widget.
// Veri kaynağı: GET /business/reports/summary + GET /business/orders/recent (tümü dinamik).
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Wallet, ShoppingBag, Leaf, Package, TrendingUp, Clock, CheckCircle2,
  AlertTriangle, ArrowRight, Star, MessageSquare, User, Zap, XCircle,
} from 'lucide-react';
import * as businessService from '../../services/businessService';
import { apiErrorMessage } from '../../services/api';
import { LightCard, Spinner, useToasts, ToastStack } from '../../components/admin/AdminUI';

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
    <div className="rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-xl shadow-gray-200/70">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-emerald-600">{tl.format(p.revenue)}</p>
      <p className="text-xs text-gray-500">{p.orders} sipariş</p>
    </div>
  );
}

// Sipariş durumuna göre görsel bilgi
const STATUS_MAP = {
  RESERVED: { label: 'Rezerve', color: 'text-amber-600 bg-amber-50', icon: Clock },
  PAID: { label: 'Ödendi', color: 'text-blue-600 bg-blue-50', icon: CheckCircle2 },
  PICKED_UP: { label: 'Teslim Edildi', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
  EXPIRED: { label: 'Süresi Doldu', color: 'text-gray-500 bg-gray-100', icon: XCircle },
  REFUNDED: { label: 'İade Edildi', color: 'text-rose-600 bg-rose-50', icon: AlertTriangle },
};

// Zaman damgası → "2 dk önce", "1 saat önce" gibi
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export default function Overview() {
  const { toasts, push } = useToasts();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      businessService.getSummary(7),
      businessService.getRecentOrders(),
    ])
      .then(([summary, orders]) => {
        setData(summary);
        setRecentOrders(orders);
      })
      .catch((err) => push(apiErrorMessage(err, 'Rapor yüklenemedi.'), 'error'))
      .finally(() => setLoading(false));
  }, [push]);

  if (loading) {
    return <LightCard><div className="flex justify-center py-24"><Spinner className="h-7 w-7" /></div></LightCard>;
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Genel Bakış</h1>
        <p className="mt-1 text-sm text-gray-500">Son 7 günün performansı ve bugünün durumu</p>
      </div>

      {/* İstatistik kartları */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
          >
            <LightCard interactive className="p-5">
              <div className={`mb-3 inline-flex rounded-xl p-2.5 ${
                s.accent === 'emerald' ? 'bg-emerald-50 text-emerald-600'
                : s.accent === 'indigo' ? 'bg-indigo-50 text-indigo-600'
                : 'bg-amber-50 text-amber-600'
              }`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-gray-900">{s.value}</p>
              <p className="mt-0.5 text-xs font-medium text-gray-400">{s.label}</p>
              {s.hint && <p className="mt-1 text-[11px] text-gray-400">{s.hint}</p>}
            </LightCard>
          </motion.div>
        ))}
      </div>

      {/* Bugünün Kutusu — Hızlı Durum Kartı */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.4 } }}
        className="mb-6"
      >
        <LightCard className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`inline-flex rounded-2xl p-3 ${
                data.today.published ? 'bg-emerald-50' : 'bg-gray-100'
              }`}>
                <Zap className={`h-6 w-6 ${data.today.published ? 'text-emerald-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {data.today.published ? 'Bugünün Kutusu Yayında' : 'Bugün Kutu Yayınlanmadı'}
                </h3>
                {data.today.published ? (
                  <p className="mt-0.5 text-xs text-gray-500">
                    Toplam {data.today.initialStock + (data.today.extraStock || 0)} kutu
                    &nbsp;·&nbsp;{data.today.sold} satıldı
                    &nbsp;·&nbsp;{data.today.remaining} bekliyor
                    &nbsp;·&nbsp;{tl.format(data.today.price)} / kutu
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-gray-500">
                    Hemen Kutu & Teslimat sekmesine gidip bugünkü kutuyu yayınlayabilirsin.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/panel/kutu')}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:bg-emerald-100 hover:shadow-md active:scale-95"
            >
              {data.today.published ? 'Kutuyu Yönet' : 'Kutu Yayınla'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Stok çubuğu (progress bar) — sadece kutu yayındaysa */}
          {data.today.published && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-medium text-gray-400">
                <span>Satış ilerleme</span>
                <span>
                  {Math.round(
                    (data.today.sold / (data.today.initialStock + (data.today.extraStock || 0))) * 100
                  )}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      100,
                      (data.today.sold / (data.today.initialStock + (data.today.extraStock || 0))) * 100
                    )}%`,
                  }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                />
              </div>
            </div>
          )}
        </LightCard>
      </motion.div>

      {/* Ana içerik: Grafik (sol) + Yan panel (sağ) */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Ciro grafiği — 3/5 genişlik */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.4 } }}
          className="lg:col-span-3"
        >
          <LightCard className="h-full p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <TrendingUp className="h-4 w-4 text-emerald-500" /> Günlük Ciro
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">Yalnızca ödemesi tamamlanan siparişler</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="transparent"
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                    tickMargin={10}
                  />
                  <YAxis
                    stroke="transparent"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(16,185,129,0.3)', strokeWidth: 1.5 }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#revGrad)"
                    dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#34d399', stroke: 'rgba(16,185,129,0.25)', strokeWidth: 6 }}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </LightCard>
        </motion.div>

        {/* Sağ panel: Son Siparişler + Puan — 2/5 genişlik */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.4 } }}
          className="flex flex-col gap-6 lg:col-span-2"
        >
          {/* Son Siparişler Akışı */}
          <LightCard className="flex-1 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <Clock className="h-4 w-4 text-indigo-500" /> Son Siparişler
              </h3>
              {recentOrders.length > 0 && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
                  {recentOrders.length}
                </span>
              )}
            </div>

            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 rounded-2xl bg-gray-50 p-4">
                  <ShoppingBag className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-400">Henüz sipariş yok</p>
                <p className="mt-1 text-xs text-gray-300">İlk siparişiniz burada görünecek</p>
              </div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {recentOrders.map((order, idx) => {
                    const status = STATUS_MAP[order.status] || STATUS_MAP.RESERVED;
                    const StatusIcon = status.icon;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.04 } }}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-gray-50"
                      >
                        {/* Avatar */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
                          <User className="h-3.5 w-3.5 text-gray-500" />
                        </div>

                        {/* Detay */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-gray-800">
                            {order.customerName}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {tl.format(order.amount)} · {timeAgo(order.createdAt)}
                          </p>
                        </div>

                        {/* Durum çipi */}
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </LightCard>

          {/* Müşteri Puanı Widget */}
          <LightCard className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-gray-900">Müşteri Puanı</h3>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50/80 py-6 text-center">
              <div className="mb-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-5 w-5 text-gray-200"
                    fill="currentColor"
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-400">Henüz değerlendirme yok</p>
              <p className="mt-1 max-w-[200px] text-[11px] text-gray-300">
                Müşteriler kutularını teslim aldıktan sonra puanlama yapabilecek
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-600">
                <MessageSquare className="h-3 w-3" />
                Yakında aktif
              </div>
            </div>
          </LightCard>
        </motion.div>
      </div>
    </div>
  );
}
