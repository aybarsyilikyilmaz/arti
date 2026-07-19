// İşletme Detay sekmelerinin ortak küçük parçaları — form dili
// BusinessSettings ile birebir aynıdır (aydınlık tema bütünlüğü).
import React from 'react';

export const inputCls = `w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900
  placeholder-gray-400 outline-none transition-all duration-300 ease-in-out
  focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10`;

export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</span>
      {children}
    </label>
  );
}

export function SectionTitle({ icon: Icon, children, tone = 'text-emerald-500' }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
      {Icon && <Icon className={`h-4 w-4 ${tone}`} />} {children}
    </h2>
  );
}
