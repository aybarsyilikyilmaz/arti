with open('frontend/src/components/PartnersStrip.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the cities with local Kadikoy neighborhoods where we have active pins
old_cities = "const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Eskişehir'];"
new_cities = "const neighborhoods = ['Moda', 'Bahariye', 'Kadıköy Çarşı', 'Yoğurtçu Parkı', 'Acıbadem', 'Kalamış'];"

content = content.replace(old_cities, new_cities)

# Replace the component markup to show a hyper-local launch story
old_markup = """    <div className="bg-white border-y border-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-gray-400 tracking-widest uppercase mb-6">
          Şu şehirlerde binlerce işletmeyle birlikteyiz
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {cities.map((city) => (
            <span key={city} className="text-lg sm:text-xl font-bold text-gray-300 hover:text-brand transition-colors cursor-default">
              {city}
            </span>
          ))}
        </div>
      </div>
    </div>"""

new_markup = """    <div className="bg-white border-y border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs sm:text-sm font-bold text-brand-dark tracking-widest uppercase mb-6 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-ping"></span>
          Şimdilik Kadıköy bölgesinde aktifiz · Yakında tüm İstanbul'da!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {neighborhoods.map((area) => (
            <span key={area} className="text-base sm:text-lg font-bold text-gray-400 hover:text-brand transition-colors cursor-default flex items-center gap-2">
              <span>📍</span> {area}
            </span>
          ))}
        </div>
      </div>
    </div>"""

content = content.replace(old_markup, new_markup)

with open('frontend/src/components/PartnersStrip.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated PartnersStrip to show authentic hyper-local launch!")
