import React from 'react';

export default function About() {
  return (
    <div className="bg-[#faf8f5] min-h-screen text-emerald-950">
      {/* Page Header */}
      <div className="pt-32 pb-16 bg-transparent">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="font-logo text-5xl lg:text-7xl font-medium text-brand tracking-tight">Hakkımızda</h1>
          <p className="text-black text-lg lg:text-2xl mt-6 font-light max-w-2xl mx-auto leading-relaxed">
            Lezzetli gıdaları israftan kurtarıyor, geleceğimizi ve çevreyi koruyoruz.
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 pb-28 lg:pb-40 space-y-28 lg:space-y-44">

        {/* Section 1: Business Model (Text Left - Image Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          <div className="order-2 lg:order-1 lg:col-span-6 space-y-6">
            <span className="text-brand font-extrabold uppercase tracking-widest text-[11px] block">İŞ MODELİMİZ</span>
            <h2 className="font-logo text-4xl lg:text-5xl font-medium text-emerald-950 leading-tight tracking-tight">
              Hem İnsanlar, Hem Gezegen İçin Kazandırıyoruz
            </h2>
            <div className="space-y-4 text-emerald-950/80 text-base lg:text-lg font-light leading-relaxed">
              <p>
                Gıda israfıyla mücadelede kazan-kazan-kazan modeliyle çalışıyoruz: İnsanlar, işletmeler ve gezegen için kazanç.
              </p>
              <p>
                Artı olarak odağımız, iyi gıdaların çöpe gitmesini önlemektir. Bunu yaparak işletmelerin gıda fazlasını ek gelire dönüştürmesine, tüketicilerin ise lezzetli gıdaları çok uygun fiyatlarla kurtarmasına yardımcı oluyoruz.
              </p>
              <p>
                Gıda israfını azaltmak, iklim değişikliğiyle mücadelede bireysel olarak atabileceğiniz en etkili adımlardan biridir.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-6">
            <div className="p-2 bg-white rounded-[2.5rem] shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-700">
              <img 
                src="/about_business_model.jpg" 
                alt="İş Modelimiz" 
                className="rounded-[2rem] w-full h-[380px] lg:h-[480px] object-cover block"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Environmental Impact (Image Left - Text Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          <div className="order-1 lg:col-span-6">
            <div className="p-2 bg-white rounded-[2.5rem] shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-700">
              <img 
                src="/about_environmental_impact.jpg" 
                alt="Çevresel Etkimiz" 
                className="rounded-[2rem] w-full h-[380px] lg:h-[480px] object-cover block"
                loading="lazy"
              />
            </div>
          </div>
          <div className="order-2 lg:col-span-6 space-y-6">
            <span className="text-brand font-extrabold uppercase tracking-widest text-[11px] block">ÇEVRESEL ETKİ</span>
            <h2 className="font-logo text-4xl lg:text-5xl font-medium text-emerald-950 leading-tight tracking-tight">
              Sürdürülebilirlik ve Yeşil Bir Gelecek
            </h2>
            <div className="space-y-4 text-emerald-950/80 text-base lg:text-lg font-light leading-relaxed">
              <p>
                Artı olarak çevresel etkimizi en üst düzeye çıkarmaya odaklanıyoruz. Kurtardığımız her bir sürpriz kutu, doğaya salınacak olan karbon emisyonunu (CO₂) ve su israfını doğrudan engeller.
              </p>
              <p>
                Yerel üreticilerle, fırınlarla ve marketlerle iş birliği yaparak gıda tasarrufu bilincini hane halkından başlayarak topluma yaymak için çalışıyoruz. Artı'ya katılarak siz de bu sürdürülebilir ekosistemin bir parçası olabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Global/Local Impact (Text Left - Image Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          <div className="order-2 lg:order-1 lg:col-span-6 space-y-6">
            <span className="text-brand font-extrabold uppercase tracking-widest text-[11px] block">YEREL KATKI</span>
            <h2 className="font-logo text-4xl lg:text-5xl font-medium text-emerald-950 leading-tight tracking-tight">
              Artı Çevrenizde: Mahallenizde İsrafı Önleyin
            </h2>
            <div className="space-y-4 text-emerald-950/80 text-base lg:text-lg font-light leading-relaxed mb-6">
              <p>
                Hızla büyüyor ve mahallenizdeki fırınlardan kafe ve süpermarketlere kadar yerel işletmelerin gıda fazlalarını koruyoruz. Artı, çevrenizdeki israfı önleyip toplumsal bilinci artırmak için her sokakta aktif.
              </p>
              <p>
                Uygulamamızı indirerek bugün ilk sürpriz kutunuzu rezerve edin ve mahallenizdeki taze lezzetleri yarı fiyatından daha ucuza kurtarmaya başlayın!
              </p>
            </div>
            <a 
              href="#download" 
              className="inline-flex items-center justify-center bg-brand hover:bg-brand-dark text-white font-bold text-sm px-10 py-4 rounded-full shadow-[0_10px_25px_rgba(15,91,71,0.2)] hover:shadow-[0_15px_30px_rgba(15,91,71,0.3)] transition duration-300 transform hover:-translate-y-0.5"
            >
              Uygulamayı İndir
            </a>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-6">
            <div className="p-2 bg-white rounded-[2.5rem] shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-700">
              <img 
                src="/about_global_impact.png" 
                alt="Yerel Katkı" 
                className="rounded-[2rem] w-full h-[380px] lg:h-[480px] object-cover block"
                loading="lazy"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
