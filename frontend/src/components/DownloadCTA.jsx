import React from 'react';
import { Apple, PlayCircle } from 'lucide-react';

export default function DownloadCTA() {
  return (
    <div id="download" className="relative bg-brand-dark overflow-hidden">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand/30 rounded-full blur-3xl"></div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Hemen İndir, İlk Kutunu Bugün Kurtar
        </h2>
        <p className="mt-4 text-lg text-brand-light max-w-xl mx-auto">
          Uygulama tamamen ücretsiz. Kaydol, çevrendeki fırsatları keşfet ve gıda israfına karşı bugün harekete geç.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#" className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-brand-dark font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg">
            <Apple className="h-6 w-6" />
            <span className="text-left leading-tight">
              <span className="block text-[11px] font-normal">İndir</span>
              App Store
            </span>
          </a>
          <a href="#" className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-brand-dark font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg">
            <PlayCircle className="h-6 w-6" />
            <span className="text-left leading-tight">
              <span className="block text-[11px] font-normal">İndir</span>
              Google Play
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
