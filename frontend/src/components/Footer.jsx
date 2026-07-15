import React from 'react';
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

// Spring and stagger animation orchestration for the letters
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12, // Stagger delays from left to right (A -> R -> T -> I)
      delayChildren: 0.15
    }
  }
};

const letterVariants = {
  hidden: { 
    opacity: 0, 
    y: 120, 
    rotateY: 85,
    rotateZ: -8,
    scale: 0.35,
    transformOrigin: "bottom center"
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 85,
      damping: 11, // Fun bouncy spring reaction
      mass: 0.85
    }
  }
};

export default function Footer() {
  const logoWord = "ARTI";

  return (
    <footer className="bg-white text-gray-600 border-t border-gray-100">
      {/* Üst bant: linkler + sosyal + mağaza rozetleri */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Link to="/" className="absolute left-4 sm:left-6 lg:left-8 top-12 hidden md:block">
          <div className="bg-brand text-white px-4 py-2 rounded-xl font-black tracking-wider text-base flex items-center justify-center gap-0.5 shadow-sm hover:bg-brand-dark transition-colors duration-200">
            <span>ARTI</span>
            <span className="text-white">+</span>
          </div>
        </Link>

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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            className="flex justify-center select-none whitespace-nowrap text-[19vw] font-extrabold tracking-tighter leading-none pt-6 text-white"
            style={{ perspective: '1000px' }}
          >
            {logoWord.split("").map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>
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
  );
}
