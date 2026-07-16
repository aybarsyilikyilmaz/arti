import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Leaf } from 'lucide-react';

const slogans = [
  { line1: "Gıdanı Kurtar,", line2: "Geleceği Koru." },
  { line1: "İşletmeni,", line2: "Artı'ya Taşı." },
  { line1: "İsrafı Önle,", line2: "Artı'ya Geç." }
];

export default function Hero() {
  const firstSloganLength = slogans[0].line1.length + slogans[0].line2.length;
  const [sloganIndex, setSloganIndex] = useState(0);
  const [charCount, setCharCount] = useState(firstSloganLength);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const currentSlogan = slogans[sloganIndex];
    const totalLength = currentSlogan.line1.length + currentSlogan.line2.length;
    
    let timer;
    
    // First load: Pause with fully typed text
    if (sloganIndex === 0 && charCount === totalLength && !hasStarted) {
      timer = setTimeout(() => {
        setIsDeleting(true);
        setHasStarted(true);
      }, 3000); // 3s pause on load
      return () => clearTimeout(timer);
    }

    if (!isDeleting) {
      // Typing phase
      if (charCount < totalLength) {
        timer = setTimeout(() => {
          setCharCount((prev) => prev + 1);
        }, 65); // Crispy type speed
      } else {
        // Pause at completion
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      // Deleting phase
      if (charCount > 0) {
        timer = setTimeout(() => {
          setCharCount((prev) => prev - 1);
        }, 30); // Faster delete
      } else {
        setIsDeleting(false);
        setSloganIndex((prev) => (prev + 1) % slogans.length);
      }
    }
    
    return () => clearTimeout(timer);
  }, [charCount, isDeleting, sloganIndex, hasStarted]);

  const currentSlogan = slogans[sloganIndex];
  let displayLine1 = "";
  let displayLine2 = "";

  if (charCount <= currentSlogan.line1.length) {
    displayLine1 = currentSlogan.line1.slice(0, charCount);
    displayLine2 = "";
  } else {
    displayLine1 = currentSlogan.line1;
    displayLine2 = currentSlogan.line2.slice(0, charCount - currentSlogan.line1.length);
  }

  return (
    <div className="relative bg-brand overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-brand-dark"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Static & High-Performance Copy */}
          <div className="text-center lg:text-left text-white">
            <h1 className="mt-6 text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl leading-tight drop-shadow-lg min-h-[110px] sm:min-h-[140px] md:min-h-[170px]">
              <span className="block mb-2">
                {displayLine1}
                {charCount <= currentSlogan.line1.length && (
                  <span className="inline-block text-green-300 font-light animate-pulse ml-1">|</span>
                )}
              </span>
              <span className="block text-green-300">
                {displayLine2}
                {charCount > currentSlogan.line1.length && (
                  <span className="inline-block text-white font-light animate-pulse ml-1">|</span>
                )}
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-brand-light max-w-lg mx-auto lg:mx-0 font-light leading-relaxed">
              Çevrendeki restoran, fırın ve marketlerin gün sonu taze ürünlerini sürpriz kutularda{' '}
              <span className="font-semibold text-white underline decoration-green-300/70 decoration-[3px] underline-offset-4">üçte bir fiyatına</span>{' '}
              al. Hem israfı önle, hem bütçeni koru!
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <a href="#download" className="flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full text-brand-dark bg-white hover:bg-gray-50 md:text-lg transition duration-300 transform hover:scale-105 shadow-lg">
                Uygulamayı İndir
              </a>
              <Link to="/business" state={{ mode: 'register' }} className="flex items-center justify-center px-8 py-4 border-2 border-white/80 text-base font-semibold rounded-full text-white bg-transparent hover:bg-white hover:text-brand-dark md:text-lg transition duration-300 transform hover:scale-105">
                İşletmeni Kaydet
              </Link>
            </div>

            {/* Canlı İstatistikler (Static - No expensive requestAnimationFrame redraws) */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 border-t border-white/15 pt-8">
              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">100+</p>
                <p className="mt-1 text-[11px] sm:text-xs font-medium text-brand-light/80 uppercase tracking-wider">Kurtarılan kutu</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">20+</p>
                <p className="mt-1 text-[11px] sm:text-xs font-medium text-brand-light/80 uppercase tracking-wider">İşletme ortağı</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-extrabold text-white">1 ton</p>
                <p className="mt-1 text-[11px] sm:text-xs font-medium text-brand-light/80 uppercase tracking-wider">Önlenen CO₂</p>
              </div>
            </div>

            {/* Trust strip */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-8 text-white/90">
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-300">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <span className="ml-2 text-sm font-medium">4.8/5 kullanıcı puanı</span>
              </div>
            </div>
          </div>

          {/* Right Column: Phone mockup (Static mockup for maximum paint efficiency) */}
          <div className="relative hidden lg:flex justify-center">
            
            {/* Sabit Telefon Gövdesi */}
            <div className="relative w-[340px] h-[737px] bg-brand-dark rounded-[3rem] border-[9px] border-gray-900/80 shadow-2xl z-10">
              {/* Phone Notch Overlay */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-10">
                <div className="w-24 h-5 bg-gray-900/80 rounded-b-2xl"></div>
              </div>
              
              {/* Phone Screen Area playing the optimized video */}
              <div className="h-full w-full rounded-[2.4rem] overflow-hidden bg-white relative">
                <video
                  src="/artıimlecsiz.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ 
                    display: 'block', 
                    imageRendering: '-webkit-optimize-contrast', 
                    transform: 'translate3d(0, 0, 0)', 
                    backfaceVisibility: 'hidden' 
                  }}
                />
              </div>
            </div>

            {/* CO₂ rozeti (Sabitlendi) */}
            <div className="absolute -right-6 bottom-24 z-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white shadow-lg">
              <p className="text-[11px] text-green-200 font-medium flex items-center gap-1"><Leaf className="h-3 w-3" /> Bu hafta önlenen</p>
              <p className="text-lg font-extrabold">312 kg CO₂</p>
            </div>


          </div>

        </div>
      </div>

      {/* Decorative Organic Shape at the Bottom */}
      <svg className="absolute bottom-0 left-0 w-full h-24 text-gray-50 fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0,224L60,202.7C120,181,240,139,360,138.7C480,139,600,181,720,202.7C840,224,960,224,1080,192C1200,160,1320,96,1380,64L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
      </svg>
    </div>
  );
}
