import React from 'react';
import { Quote } from 'lucide-react';

const reviews = [
  {
    name: 'Elif K.',
    role: 'Kadıköy, İstanbul',
    text: 'İlk kutumu açtığımda içinden taze poğaça ve simitler çıktı, hem de market fiyatının üçte biri. Artık her akşam uygulamayı kontrol ediyorum.',
  },
  {
    name: 'Mert D.',
    role: 'Çankaya, Ankara',
    text: 'Öğrenci bütçesiyle kaliteli yemek bulmak zordu. Artı sayesinde hem tasarruf ediyorum hem de israfı önlediğimi biliyorum.',
  },
  {
    name: 'Fırın Keyfi',
    role: 'İşletme Ortağı, Bursa',
    text: 'Gün sonunda elimizde kalan ürünleri artık çöpe atmıyoruz. Artı ile hem ek gelir elde ediyoruz hem de yeni müşterilerle tanışıyoruz.',
  },
];

export default function Testimonials() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm text-brand font-bold tracking-widest uppercase">Kullanıcılarımız Ne Diyor?</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Binlerce Kişi Zaten Katıldı
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r) => (
            <div key={r.name} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 relative hover:shadow-lg transition-shadow duration-300">
              <Quote className="h-8 w-8 text-brand/20 mb-4" />
              <p className="text-gray-700 leading-relaxed">"{r.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center font-bold">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
