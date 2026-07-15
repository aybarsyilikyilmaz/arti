import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Sürpriz kutunun içinde ne olduğunu önceden bilebilir miyim?',
    a: 'Kutunun tam içeriği bir sürpriz olsa da, işletmenin kategorisini (fırın, restoran, market vb.) ve tahmini değerini her zaman görürsün.',
  },
  {
    q: 'Kutumu ne zaman teslim almam gerekiyor?',
    a: 'Her işletmenin belirlediği bir teslim alma saat aralığı vardır, genellikle günün sonunda. Rezervasyon sırasında bu saatleri görebilirsin.',
  },
  {
    q: 'İşletmem nasıl Artı\'ya katılabilir?',
    a: '"İşletmeni Kaydet" butonuna tıklayıp birkaç dakika içinde ücretsiz hesabını oluşturabilir, aynı gün ilk kutunu yayınlayabilirsin.',
  },
  {
    q: 'Ödeme uygulama üzerinden mi yapılıyor?',
    a: 'Evet, ödeme güvenli bir şekilde uygulama içinden alınır. Mağazaya gittiğinde sadece rezervasyon kodunu göstermen yeterli.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-semibold text-gray-900">{q}</span>
        <ChevronDown className={`h-5 w-5 text-brand flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-gray-600 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-sm text-brand font-bold tracking-widest uppercase">Merak Edilenler</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Sıkça Sorulan Sorular
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </div>
  );
}
