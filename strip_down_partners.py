with open('frontend/src/components/PartnersStrip.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the entire component with a slim, single-line launch announcement banner
new_component = """import React from 'react';

export default function PartnersStrip() {
  return (
    <div className="bg-white border-y border-gray-100 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs sm:text-sm font-bold text-brand-dark tracking-widest uppercase flex items-center justify-center gap-2">
          {/* Double-pulse green indicator for active status */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Şimdilik Kadıköy bölgesinde aktifiz · Yakında tüm İstanbul'da!
        </p>
      </div>
    </div>
  );
}
"""

with open('frontend/src/components/PartnersStrip.jsx', 'w', encoding='utf-8') as f:
    f.write(new_component)

print("Successfully slimmed PartnersStrip to a single-line announcement banner!")
