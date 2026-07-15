new_placeholder_content = """import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function PlaceholderSection() {
  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    // Infinite loop cycle of 11 seconds: Lid opens -> Staggered float & slide -> Reset -> Lid closes
    const interval = setInterval(() => {
      setLoopKey((prev) => prev + 1);
    }, 11000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { emoji: '🍩', label: 'Donut' },
    { emoji: '🍞', label: 'Ekmek' },
    { emoji: '🥯', label: 'Poğaça' },
    { emoji: '🍰', label: 'Ekler' },
    { emoji: '🍣', label: 'Sushi' }
  ];

  // 11s Timeline: Open from 0.5s to 1.6s, hold open, close from 9.3s to 10.4s
  const lidVariants = {
    closed: { rotateX: 0 },
    open: {
      rotateX: [0, -115, -115, 0],
      transition: {
        duration: 11,
        times: [0.05, 0.15, 0.85, 0.95],
        ease: "easeInOut"
      }
    }
  };

  // Staggered items timeline
  const itemVariants = (index) => {
    const startX = -(index - 2) * 120; // Centers the start coordinates inside the box
    return {
      hidden: { y: 320, x: startX, scale: 0, opacity: 0 },
      visible: {
        x: [startX, startX, 0, 0, startX],
        y: [320, 0, 0, 0, 320],
        scale: [0, 1.25, 1, 0, 0],
        opacity: [0, 1, 1, 0, 0],
        transition: {
          duration: 11,
          times: [
            (1.2 + index * 1.0) / 11, // Start float-up out of box
            (2.2 + index * 1.0) / 11, // Finish float-up, start slide-left to row
            (3.2 + index * 1.0) / 11, // Finish slide-left, remain in row
            8.5 / 11,                 // Fade-out/vanish
            9.2 / 11                  // Reset location
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
        <div className="flex justify-center items-center gap-6 h-28 w-full max-w-3xl relative">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              variants={itemVariants(i)}
              initial="hidden"
              animate="visible"
              className="w-20 h-20 sm:w-24 sm:h-24 flex-none bg-white/95 backdrop-blur-md rounded-2xl border-2 border-brand/20 shadow-xl flex flex-col items-center justify-center z-20"
            >
              <span className="text-3xl sm:text-4xl mb-1 select-none">{item.emoji}</span>
              <span className="text-[10px] sm:text-xs font-bold text-brand-dark tracking-wide">{item.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Bottom Area: Cardboard Box */}
        <div className="relative w-80 h-64 flex flex-col items-center justify-end select-none perspective-[1000px] pb-4">
          
          {/* Cardboard Inner back plate (shields items as they start rising) */}
          <div className="absolute bottom-4 w-64 h-32 bg-amber-900 rounded-2xl z-0 shadow-inner border border-amber-950/40"></div>
          
          {/* Cardboard Box Lid (flips open backwards) */}
          <motion.div
            variants={lidVariants}
            initial="closed"
            animate="open"
            className="absolute bottom-[140px] w-64 h-24 bg-amber-700/90 rounded-t-2xl z-10 shadow-md origin-bottom border-b border-amber-800/60"
            style={{ transformStyle: 'preserve-3d' }}
          />

          {/* Cardboard Box Front plate (renders on top of floating items) */}
          <div className="relative w-64 h-36 bg-amber-800 rounded-b-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-30 border-t border-amber-700 flex flex-col items-center justify-center">
            <Leaf className="h-8 w-8 text-amber-100/40 mb-2" />
            <span className="text-amber-100/40 font-extrabold tracking-widest text-[10px] uppercase">
              ARTIS+ SÜRPRİZ KUTU
            </span>
          </div>

        </div>

      </div>

      {/* Floating cue info */}
      <div className="relative text-center text-xs font-medium text-brand-light/60 animate-pulse z-40">
        📦 Sürpriz kutu kapağı açıldığında çıkan lezzetleri izleyin
      </div>
    </div>
  );
}
"""

with open('frontend/src/components/PlaceholderSection.jsx', 'w', encoding='utf-8') as f:
    f.write(new_placeholder_content)

print("Successfully replaced PlaceholderSection with the 3D-opening food rescue box animation!")
