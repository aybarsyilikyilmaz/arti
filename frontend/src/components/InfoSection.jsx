import React, { useRef } from 'react';
import { Package, MapPin, Smile, TrendingDown } from 'lucide-react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';

export default function InfoSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  // Smooth out the raw scroll progress using spring physics for a luxurious, fluid slide feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55, // Sweeping, elegant velocity
    damping: 20,    // Absorb velocity smoothly without bouncing
    mass: 0.8
  });

  // Mathematically maps the scroll to slide each card precisely to the viewport center
  const x = useTransform(smoothProgress, [0.12, 0.88], ["0%", "-66.6%"]);

  const steps = [
    {
      id: 1,
      num: '01',
      name: 'Keşfet',
      description: 'Haritada çevrendeki işletmelerin sunduğu sürpriz kutuları anında bul.',
      image: '/step_discover_v2.jpg',
      icon: MapPin,
    },
    {
      id: 2,
      num: '02',
      name: 'Rezerve Et',
      description: 'Kutunu uygulama üzerinden saniyeler içinde üçte bir fiyatına rezerve et.',
      image: '/step_reserve_v3.jpg',
      icon: Package,
    },
    {
      id: 3,
      num: '03',
      name: 'Teslim Al',
      description: 'Belirtilen saat aralığında mağazaya git, kutunu al ve lezzetin tadını çıkar!',
      image: '/step_pickup_v5.jpg',
      icon: Smile,
    },
  ];

  return (
    <>
      {/* Horizontal Scroll Section (Huge Inc. style) */}
      <div ref={containerRef} className="relative h-[250vh] bg-gray-50 border-t border-gray-100">
        {/* Sticky viewports container */}
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-between py-12 md:py-16">
          
          {/* Header text */}
          <div className="text-center px-4">
            <h2 className="text-xs sm:text-sm text-brand font-bold tracking-widest uppercase">Sistem Nasıl Çalışır?</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Sürpriz Kutu Konsepti
            </p>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-gray-500 mx-auto">
              Gün sonunda satılamayan taze ve lezzetli ürünleri sürpriz kutularda toplayıp israfı önlüyoruz.
            </p>
          </div>
          
          {/* Horizontal Track holding the huge interactive step cards */}
          <div className="flex-1 flex items-center relative my-4">
            <motion.div style={{ x }} className="flex gap-[20vw] px-[10vw]">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className="w-[80vw] h-[400px] sm:h-[480px] md:h-[520px] lg:h-[560px] flex-none flex flex-col md:flex-row bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 relative"
                >
                  {/* Step Description */}
                  <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-between h-[50%] md:h-full">
                    <div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-light text-brand">
                          <step.icon className="h-6 w-6" />
                        </span>
                        <span className="text-5xl font-extrabold text-brand-light">{step.num}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-6">{step.name}</h3>
                      <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-500 leading-relaxed">{step.description}</p>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-brand tracking-wider uppercase">
                      <span>KAYDIRMAYA DEVAM ET</span>
                      <span>→</span>
                    </div>
                  </div>
                  
                  {/* Step Image */}
                  <div className="w-full md:w-1/2 h-[45%] md:h-full relative overflow-hidden bg-gray-100">
                    <img 
                      src={step.image} 
                      alt={step.name} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Scroll cue hint */}
          <div className="text-center text-xs font-medium text-gray-400 animate-pulse flex items-center justify-center gap-1">
            <span>🖱️</span>
            <span>Mouse tekerleği ile aşağı kaydırarak adımları izleyin</span>
          </div>
          
        </div>
      </div>

      {/* Statistics & Mission Area */}
      <div className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-light rounded-[2.5rem] p-8 sm:p-12 lg:p-16 border border-brand/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column: Text + Stats Row */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-3xl font-extrabold text-brand-dark mb-4 leading-tight">
                    Gıda İsrafına Karşı Birlikteyiz
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed font-light">
                    Türkiye'de her yıl milyonlarca ton gıda çöpe gidiyor. Artı ile bu gıdaları kurtararak karbon ayak izimizi küçültüyor, dünyamıza nefes aldırıyoruz.
                  </p>
                </div>
                
                {/* Stats Row aligned at the bottom of the text */}
                <div className="grid grid-cols-2 gap-6 mt-8 sm:mt-10">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
                    <TrendingDown className="h-10 w-10 text-brand mx-auto mb-3" />
                    <div className="text-3xl font-extrabold text-gray-900">-%30</div>
                    <div className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wide">
                      İsraf Azalımı
                    </div>
                  </div>
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
                    <Package className="h-10 w-10 text-brand mx-auto mb-3" />
                    <div className="text-3xl font-extrabold text-gray-900">100+</div>
                    <div className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wide">
                      Kurtarılan Kutu
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column: Zero Waste Visual */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 h-[360px] sm:h-[420px]">
                <img 
                  src="/food_waste_mission.jpg" 
                  alt="Sıfır atık taze gıda koruma" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
