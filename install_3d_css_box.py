new_placeholder_content = """import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PlaceholderSection() {
  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    // 12-second loop cycle for the dynamic 3D pastry box and floating foods
    const interval = setInterval(() => {
      setLoopKey((prev) => prev + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { image: '/food_donut.jpg', label: 'Donut' },
    { image: '/food_bread.jpg', label: 'Ekmek' },
    { image: '/food_pastries.jpg', label: 'Poğaça' },
    { image: '/food_baklava.jpg', label: 'Ekler' },
    { image: '/food_sushi.jpg', label: 'Sushi' }
  ];

  // Lid swings open from -90deg (flat closed) to -225deg (swung wide open backwards)
  const lidVariants = {
    closed: { rotateX: -90 },
    open: {
      rotateX: [-90, -225, -225, -90],
      transition: {
        duration: 12,
        times: [0.05, 0.18, 0.82, 0.95],
        ease: "easeInOut"
      }
    }
  };

  // Staggered items timeline
  const itemVariants = (index) => {
    const startX = -(index - 2) * 130; // Centers the start coordinates inside the box
    return {
      hidden: { y: 280, x: startX, scale: 0, opacity: 0, rotate: 0 },
      visible: {
        x: [startX, startX, 0, 0, startX],
        y: [280, 0, 0, 0, 280],
        scale: [0, 1.25, 1, 0, 0],
        rotate: [0, 15, 0, 0, 0],
        opacity: [0, 1, 1, 0, 0],
        transition: {
          duration: 12,
          times: [
            (1.5 + index * 1.1) / 12, // Emerges out of box
            (2.5 + index * 1.1) / 12, // Reaches peak vertical height
            (3.6 + index * 1.1) / 12, // Slides left into final row spot
            8.6 / 12,                 // Starts fade out
            9.3 / 12                  // Resets position
          ],
          ease: "easeInOut"
        }
      }
    };
  };

  return (
    <div key={loopKey} className="relative w-full h-screen bg-brand overflow-hidden flex flex-col justify-between py-12 md:py-16 border-t border-brand-dark/20" data-theme="dark">
      {/* Background Gradient & Overlay identical to Hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-brand-dark"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-300/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
      
      {/* Header Info */}
      <div className="relative text-center px-4 z-40">
        <h2 className="text-xs sm:text-sm text-green-300 font-bold tracking-widest uppercase">Sürprizlerin İçeriği</h2>
        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
          Kutudan Ne Çıkacak?
        </p>
        <p className="mt-3 max-w-xl text-sm sm:text-base text-brand-light/90 mx-auto font-light leading-relaxed">
          Taze fırın ürünlerinden leziz atıştırmalıklara kadar gün sonunda israfı önlenen her sürpriz kutu yepyeni lezzetlerle dolu!
        </p>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative flex-1 flex flex-col items-center justify-between my-4 z-10">
        
        {/* Top Row: Items landing spot */}
        <div className="flex justify-center items-center gap-8 h-28 w-full max-w-4xl relative">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              variants={itemVariants(i)}
              initial="hidden"
              animate="visible"
              className="w-24 h-24 sm:w-28 sm:h-28 flex-none bg-white p-1 rounded-full border-2 border-white/90 shadow-2xl flex flex-col items-center justify-center z-20 overflow-hidden relative group hover:scale-105 transition-transform duration-300"
            >
              {/* Photorealistic circular food image cutout */}
              <img 
                src={item.image} 
                alt={item.label} 
                className="w-full h-full object-cover rounded-full"
              />
              {/* Sleek overlay tag showing the item label */}
              <div className="absolute bottom-1 bg-black/70 text-[9px] sm:text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full select-none">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Area: Actual 3D CSS Cardboard Pastry Box (White box, no print) */}
        <div className="relative w-80 h-64 flex flex-col items-center justify-end select-none pb-4" style={{ perspective: '1200px' }}>
          
          {/* 3D Box Container rotated slightly to showcase depth */}
          <div 
            className="relative w-64 h-36 transform-style-3d rotate-x-[18deg] rotate-y-[-12deg] transition-transform duration-700 hover:rotate-x-[24deg] hover:rotate-y-[-6deg]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            
            {/* Box Face: Bottom */}
            <div 
              className="absolute w-64 h-[192px] bg-gray-300 border border-gray-400/60 rounded-sm shadow-inner"
              style={{
                left: 0,
                top: 0,
                transform: 'rotateX(90deg) translateZ(-124px)',
                transformStyle: 'preserve-3d'
              }}
            />

            {/* Box Face: Back */}
            <div 
              className="absolute w-64 h-36 bg-gray-100 border border-gray-300/60 rounded-sm"
              style={{
                left: 0,
                top: 0,
                transform: 'translateZ(-96px) rotateY(180deg)'
              }}
            />

            {/* Box Face: Left */}
            <div 
              className="absolute w-[192px] h-36 bg-gray-50 border border-gray-300/60 rounded-sm"
              style={{
                left: '32px',
                top: 0,
                transform: 'rotateY(90deg) translateZ(-128px)'
              }}
            />

            {/* Box Face: Right */}
            <div 
              className="absolute w-[192px] h-36 bg-gray-50 border border-gray-300/60 rounded-sm"
              style={{
                left: '32px',
                top: 0,
                transform: 'rotateY(90deg) translateZ(128px)'
              }}
            />

            {/* Box Face: Top Lid (Swings open backwards around top-back axis) */}
            <motion.div
              variants={lidVariants}
              initial="closed"
              animate="open"
              className="absolute w-64 h-[192px] bg-white border border-gray-200 shadow-md rounded-t-sm origin-top"
              style={{
                left: 0,
                top: 0,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
            />

            {/* Box Face: Front (Renders on top of everything, covering the items inside) */}
            <div 
              className="absolute w-64 h-36 bg-white border border-gray-200 rounded-sm shadow-[0_12px_24px_rgba(0,0,0,0.15)] z-30"
              style={{
                left: 0,
                top: 0,
                transform: 'translateZ(96px)'
              }}
            />

          </div>

        </div>

      </div>

      {/* Floating cue info */}
      <div className="relative text-center text-xs font-medium text-brand-light/60 animate-pulse z-40">
        📦 3D tatlı kutusundan süzülen gerçek lezzetleri izleyin
      </div>
    </div>
  );
}
"""

with open('frontend/src/components/PlaceholderSection.jsx', 'w', encoding='utf-8') as f:
    f.write(new_placeholder_content)

print("Successfully replaced PlaceholderSection with the real 3D CSS white pastry box and photorealistic food tokens!")
