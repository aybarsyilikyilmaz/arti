import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Linkedin, Instagram, Facebook, Youtube, Twitter, Apple, PlayCircle } from 'lucide-react';

const topLinks = [
  { label: 'Kariyer', to: '/' },
  { label: 'Basın', to: '/' },
  { label: 'Destek', to: '/' },
  { label: 'İşletme Portalı', to: '/business' },
];

const legalLinks = ['Yasal', 'Gizlilik Politikası', 'Çerez Politikası', 'Şartlar ve Koşullar', 'Bize Ulaşın'];

function LogoIcon({ className }) {
  return (
    <svg viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Right branch stem */}
      <path d="M 45 42 Q 65 42 85 25" />
      {/* Right branch leaves */}
      <path d="M 55 40 Q 52 30 63 24 Q 61 35 55 40 Z" />
      <path d="M 68 35 Q 65 24 77 18 Q 75 28 68 35 Z" />
      <path d="M 80 28 Q 80 18 92 18 Q 88 28 80 28 Z" />
      <path d="M 58 41 Q 65 48 72 45 Q 65 38 58 41 Z" />
      <path d="M 70 34 Q 78 40 85 38 Q 77 32 70 34 Z" />
      {/* Right branch berries */}
      <path d="M 62 38 L 65 23" />
      <circle cx="65" cy="23" r="2" fill="currentColor" />
      <path d="M 73 31 L 77 16" />
      <circle cx="77" cy="16" r="2" fill="currentColor" />
      <path d="M 82 27 L 87 12" />
      <circle cx="87" cy="12" r="2" fill="currentColor" />

      {/* Left branch stem */}
      <path d="M 55 40 Q 35 38 15 55" />
      {/* Left branch leaves */}
      <path d="M 45 40 Q 48 50 37 56 Q 39 45 45 40 Z" />
      <path d="M 32 45 Q 35 56 23 62 Q 25 52 32 45 Z" />
      <path d="M 20 52 Q 20 62 8 62 Q 12 52 20 52 Z" />
      <path d="M 42 39 Q 35 32 28 35 Q 35 42 42 39 Z" />
      <path d="M 30 46 Q 22 40 15 42 Q 23 48 30 46 Z" />
      {/* Left branch berries */}
      <path d="M 38 42 L 35 57" />
      <circle cx="35" cy="57" r="2" fill="currentColor" />
      <path d="M 27 49 L 23 64" />
      <circle cx="23" cy="64" r="2" fill="currentColor" />
      <path d="M 18 53 L 13 68" />
      <circle cx="13" cy="68" r="2" fill="currentColor" />
    </svg>
  );
}

const socials = [Linkedin, Instagram, Facebook, Youtube, Twitter];


export default function Footer() {
  const logoWord = "Artı";
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

  // Leaf branch logo: fades and slides from left
  const xLogo = useTransform(smoothProgress, [0.0, 0.40], [-80, 0]);
  const oLogo = useTransform(smoothProgress, [0.0, 0.35], [0, 1]);

  // Letter 1: 'A' (Fades in first)
  const x0 = useTransform(smoothProgress, [0.10, 0.55], [-60, 0]);
  const o0 = useTransform(smoothProgress, [0.10, 0.50], [0, 1]);

  // Letter 2: 'r'
  const x1 = useTransform(smoothProgress, [0.20, 0.70], [-40, 0]);
  const o1 = useTransform(smoothProgress, [0.20, 0.65], [0, 1]);

  // Letter 3: 't'
  const x2 = useTransform(smoothProgress, [0.30, 0.85], [-30, 0]);
  const o2 = useTransform(smoothProgress, [0.30, 0.80], [0, 1]);

  // Letter 4: 'ı' (Fades in last)
  const x3 = useTransform(smoothProgress, [0.40, 1.00], [-20, 0]);
  const o3 = useTransform(smoothProgress, [0.40, 0.95], [0, 1]);

  const letterTransforms = [
    { x: x0, opacity: o0, char: 'A' },
    { x: x1, opacity: o1, char: 'r' },
    { x: x2, opacity: o2, char: 't' },
    { x: x3, opacity: o3, char: 'ı' }
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
          {/* Simple and elegant fade-in container for individual letters */}
          <div
            className="flex justify-center items-center select-none whitespace-nowrap text-[10vw] font-logo italic font-semibold tracking-wide pt-4 text-white"
          >
            {/* Dev beyaz yaprak dalı logosu */}
            <motion.div
              style={{
                x: xLogo,
                opacity: oLogo
              }}
              className="inline-flex items-center mr-[1.5vw]"
            >
              <LogoIcon className="h-[8vw] w-auto" />
            </motion.div>

            {letterTransforms.map((lt, index) => (
              <motion.span
                key={index}
                style={{
                  x: lt.x,
                  opacity: lt.opacity
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
