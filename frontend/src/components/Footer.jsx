import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Linkedin, Instagram, Facebook, Youtube, Twitter, Apple, PlayCircle } from 'lucide-react';

const topLinks = [
  { label: 'Kariyer', to: '/' },
  { label: 'Basın', to: '/' },
  { label: 'Destek', to: '/' },
  { label: 'İşletme Portalı', to: '/business' },
];

const legalLinks = ['Yasal', 'Gizlilik Politikası', 'Çerez Politikası', 'Şartlar ve Koşullar', 'Bize Ulaşın'];

const socials = [Linkedin, Instagram, Facebook, Youtube, Twitter];



import { useScroll, useTransform, useSpring, motion } from 'framer-motion';

export default function Footer() {
  const logoWord = "ARTI";
  const footerRef = useRef(null);
  const spacerRef = useRef(null);
  const [footerHeight, setFooterHeight] = useState(0);

  // Track the scroll progress of the footer spacer in the document flow
  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ["start end", "end end"]
  });

  // Smooth scroll progress using spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 20,
    mass: 0.5
  });

  // Letter 1: 'A'
  const y0 = useTransform(smoothProgress, [0.0, 0.65], [160, 0]);
  const x0 = useTransform(smoothProgress, [0.0, 0.75], [-140, 0]);
  const r0 = useTransform(smoothProgress, [0.0, 0.75], [-45, 0]);
  const o0 = useTransform(smoothProgress, [0.0, 0.45], [0, 1]);

  // Letter 2: 'R'
  const y1 = useTransform(smoothProgress, [0.1, 0.75], [180, 0]);
  const x1 = useTransform(smoothProgress, [0.1, 0.85], [-40, 0]);
  const r1 = useTransform(smoothProgress, [0.1, 0.85], [-20, 0]);
  const o1 = useTransform(smoothProgress, [0.1, 0.55], [0, 1]);

  // Letter 3: 'T'
  const y2 = useTransform(smoothProgress, [0.2, 0.85], [180, 0]);
  const x2 = useTransform(smoothProgress, [0.2, 0.90], [40, 0]);
  const r2 = useTransform(smoothProgress, [0.2, 0.90], [20, 0]);
  const o2 = useTransform(smoothProgress, [0.2, 0.65], [0, 1]);

  // Letter 4: 'I'
  const y3 = useTransform(smoothProgress, [0.3, 0.95], [160, 0]);
  const x3 = useTransform(smoothProgress, [0.3, 1.00], [140, 0]);
  const r3 = useTransform(smoothProgress, [0.3, 1.00], [45, 0]);
  const o3 = useTransform(smoothProgress, [0.3, 0.75], [0, 1]);

  const letterTransforms = [
    { y: y0, x: x0, rotate: r0, opacity: o0, char: 'A' },
    { y: y1, x: x1, rotate: r1, opacity: o1, char: 'R' },
    { y: y2, x: x2, rotate: r2, opacity: o2, char: 'T' },
    { y: y3, x: x3, rotate: r3, opacity: o3, char: 'I' }
  ];

  useEffect(() => {
    if (!footerRef.current) return;
    
    const handleResize = () => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(footerRef.current);
    
    handleResize(); // Initial measurement
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <>
      {/* Spacer that pushes page scroll flow to match the fixed footer height */}
      <div ref={spacerRef} style={{ height: footerHeight }} className="pointer-events-none w-full" />

      {/* Fixed footer behind the page */}
      <footer 
        ref={footerRef} 
        className="fixed bottom-0 left-0 w-full z-0"
        style={{ backfaceVisibility: 'hidden', transform: 'translate3d(0,0,0)' }}
      >
      {/* Üst bant: linkler + sosyal + mağaza rozetleri */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col items-center gap-8">
          <nav className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {topLinks.map((l) => (
              <Link key={l.label} to={l.to} className="text-sm font-bold tracking-widest uppercase text-gray-800 hover:text-brand transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            {socials.map((Icon, i) => (
              <a key={i} href="#" aria-label="Sosyal medya" className="text-gray-400 hover:text-brand transition-colors">
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </a>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a href="#" className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition">
              <Apple className="h-5 w-5" />
              <span className="text-left leading-tight text-sm">
                <span className="block text-[10px] font-normal">İndir</span>
                App Store
              </span>
            </a>
            <a href="#" className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition">
              <PlayCircle className="h-5 w-5" />
              <span className="text-left leading-tight text-sm">
                <span className="block text-[10px] font-normal">İndir</span>
                Google Play
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Alt bant: scroll ile beliren dev marka yazısı ve tüm alt yasal bilgiler (Komple Anasayfa Yeşili) */}
      <div className="bg-brand-dark overflow-hidden text-brand-light">
        <div className="max-w-[100rem] mx-auto px-2">
          {/* 3D Perspective container holding individual animated letters */}
          <div
            className="flex justify-center select-none whitespace-nowrap text-[19vw] font-extrabold tracking-tighter leading-none pt-6 text-white"
            style={{ perspective: '1000px' }}
          >
            {letterTransforms.map((lt, index) => (
              <motion.span
                key={index}
                style={{
                  y: lt.y,
                  x: lt.x,
                  rotate: lt.rotate,
                  opacity: lt.opacity,
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'bottom center'
                }}
                className="inline-block"
              >
                {lt.char}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-4">
          <nav className="flex flex-wrap justify-center gap-x-10 gap-y-3 pt-2 pb-6 border-t border-white/10">
            {legalLinks.map((l) => (
              <a key={l} href="#" className="text-sm text-brand-light/80 hover:text-white transition-colors">
                {l}
              </a>
            ))}
          </nav>
          <p className="text-center text-sm text-brand-light/60">
            Copyright &copy; {new Date().getFullYear()} Artı. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
    </>
  );
}
