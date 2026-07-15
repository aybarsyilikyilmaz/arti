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

export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 border-t border-gray-100">
      {/* Üst bant: linkler + sosyal + mağaza rozetleri */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Link to="/" className="absolute left-4 sm:left-6 lg:left-8 top-14 text-2xl font-bold text-brand-dark tracking-tight hidden md:block">
          Artı
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

      {/* Alt bant: scroll ile beliren dev marka yazısı */}
      <div className="bg-white overflow-hidden border-t border-gray-100">
        <div className="max-w-[100rem] mx-auto px-2">
          <motion.p
            initial={{ y: '35%', opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-center font-extrabold tracking-tighter leading-none text-brand select-none whitespace-nowrap text-[19vw] pt-6"
            aria-hidden="true"
          >
            ARTI
          </motion.p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <nav className="flex flex-wrap justify-center gap-x-10 gap-y-3 pt-2 pb-6">
            {legalLinks.map((l) => (
              <a key={l} href="#" className="text-sm text-gray-500 hover:text-brand transition-colors">
                {l}
              </a>
            ))}
          </nav>
          <p className="text-center text-sm text-gray-400">
            Copyright &copy; {new Date().getFullYear()} Artı. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
