import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Leaf } from 'lucide-react';

// Sayı yukarı doğru sayarak geliyor (10.000+ kutu vb.)
function CountUp({ end, duration = 2200, suffix = '' }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = null;
    let raf;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return <>{val.toLocaleString('tr-TR')}{suffix}</>;
}

// Telefonun yanında dönen canlı "kutu kurtarıldı" bildirimleri
const liveEvents = [
  { emoji: '🥐', place: 'Fırın Keyfi · Kadıköy', time: 'az önce' },
  { emoji: '🥗', place: 'Manolya Cafe · Moda', time: '2 dk önce' },
  { emoji: '🍞', place: 'Papatya Cafe · Çankaya', time: '3 dk önce' },
  { emoji: '🍅', place: 'Yeşil Market · Karşıyaka', time: '5 dk önce' },
];

function LiveToast() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((p) => (p + 1) % liveEvents.length), 8000);
    return () => clearInterval(t);
  }, []);

  const e = liveEvents[index];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 16, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 w-64"
      >
        <span className="h-10 w-10 flex-none rounded-xl bg-brand-light flex items-center justify-center text-xl">{e.emoji}</span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            Kutu kurtarıldı · {e.time}
          </p>
          <p className="text-sm font-bold text-brand-dark truncate">{e.place}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Sol kolon: başlık/paragraf/butonlar sırayla (stagger) aşağıdan yukarı fade-in
const columnVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// Telefon içindeki liste kartları için stagger
const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.9 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const slogans = [
  { line1: "Gıdanı Kurtar,", line2: "Geleceği Koru." },
  { line1: "İşletmeni,", line2: "Artı'ya Taşı." },
  { line1: "İsrafı Önle,", line2: "Artı'ya Geç." }
];

export default function Hero() {
  const [sloganIndex, setSloganIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentSlogan = slogans[sloganIndex];
    const totalLength = currentSlogan.line1.length + currentSlogan.line2.length;
    
    let timer;
    
    if (!isDeleting) {
      // Typing phase
      if (charCount < totalLength) {
        timer = setTimeout(() => {
          setCharCount((prev) => prev + 1);
        }, 65); // Crisp typing speed (65ms per char)
      } else {
        // Pause at completion
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200); // 2.2s pause for reading
      }
    } else {
      // Deleting phase
      if (charCount > 0) {
        timer = setTimeout(() => {
          setCharCount((prev) => prev - 1);
        }, 30); // Faster delete speed (30ms per char)
      } else {
        // Swap slogan
        setIsDeleting(false);
        setSloganIndex((prev) => (prev + 1) % slogans.length);
      }
    }
    
    return () => clearTimeout(timer);
  }, [charCount, isDeleting, sloganIndex]);

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
      {/* Background Gradient & Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-brand-dark"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-300/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
      {/* Film greni: düz yeşili kırıp yüzeye doku kazandırıyor */}
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-soft-light pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 lg:pt-24 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy — staggered entrance */}
          <motion.div
            className="text-center lg:text-left"
            variants={columnVariants}
            initial="hidden"
            animate="visible"
          >


            <motion.h1
              variants={itemVariants}
              className="mt-6 text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl leading-tight drop-shadow-lg min-h-[110px] sm:min-h-[140px] md:min-h-[170px]"
            >
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
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg sm:text-xl text-brand-light max-w-lg mx-auto lg:mx-0 font-light leading-relaxed"
            >
              Çevrendeki restoran, fırın ve marketlerin gün sonu taze ürünlerini sürpriz kutularda{' '}
              <span className="font-semibold text-white underline decoration-green-300/70 decoration-[3px] underline-offset-4">üçte bir fiyatına</span>{' '}
              al. Hem israfı önle, hem bütçeni koru!
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
            >
              <a href="#download" className="flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full text-brand-dark bg-white hover:bg-gray-50 md:text-lg transition duration-300 transform hover:scale-105 shadow-lg">
                Uygulamayı İndir
              </a>
              <Link to="/business" state={{ mode: 'register' }} className="flex items-center justify-center px-8 py-4 border-2 border-white/80 text-base font-semibold rounded-full text-white bg-transparent hover:bg-white hover:text-brand-dark md:text-lg transition duration-300 transform hover:scale-105">
                İşletmeni Kaydet
              </Link>
            </motion.div>

            {/* Canlı istatistikler: rakamlar yukarı sayarak geliyor */}
            <motion.div
              variants={itemVariants}
              className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 border-t border-white/15 pt-8"
            >
              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums"><CountUp end={100} />+</p>
                <p className="mt-1 text-[11px] sm:text-xs font-medium text-brand-light/80 uppercase tracking-wider">Kurtarılan kutu</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums"><CountUp end={20} />+</p>
                <p className="mt-1 text-[11px] sm:text-xs font-medium text-brand-light/80 uppercase tracking-wider">İşletme ortağı</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums"><CountUp end={1} /> ton</p>
                <p className="mt-1 text-[11px] sm:text-xs font-medium text-brand-light/80 uppercase tracking-wider">Önlenen CO₂</p>
              </div>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex items-center justify-center lg:justify-start gap-8 text-white/90"
            >
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-300">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <span className="ml-2 text-sm font-medium">4.8/5 kullanıcı puanı</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Phone mockup */}
          <motion.div
            className="relative hidden lg:flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          >
            {/* Telefonun arkasında nefes alan ışık halesi */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[620px] rounded-full bg-green-300/20 blur-[110px] pointer-events-none"
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.07, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            ></motion.div>

            {/* Sürekli yukarı-aşağı süzülme (infinite yoyo) */}
            <motion.div
              className="relative w-[340px] h-[737px] bg-brand-dark rounded-[3rem] border-[9px] border-gray-900/80 shadow-2xl"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              {/* Phone Notch Overlay */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-10">
                <div className="w-24 h-5 bg-gray-900/80 rounded-b-2xl"></div>
              </div>
              
              {/* Phone Screen Area playing the screen recording */}
              <div className="h-full w-full rounded-[2.4rem] overflow-hidden bg-white relative">
                <video
                  src="/artıimlecsiz.mov"
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
            </motion.div>



            {/* CO₂ rozeti: buzlu cam efektiyle sağ altta süzülüyor */}
            <motion.div
              className="absolute -right-6 bottom-24 z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-white shadow-lg"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
              transition={{
                opacity: { delay: 1.6, duration: 0.4 },
                scale: { delay: 1.6, type: 'spring', stiffness: 260, damping: 18 },
                y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 },
              }}
            >
              <p className="text-[11px] text-green-200 font-medium flex items-center gap-1"><Leaf className="h-3 w-3" /> Bu hafta önlenen</p>
              <p className="text-lg font-extrabold tabular-nums">312 kg CO₂</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Organic Shape at the Bottom */}
      <svg className="absolute bottom-0 left-0 w-full h-24 text-gray-50 fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path d="M0,224L60,202.7C120,181,240,139,360,138.7C480,139,600,181,720,202.7C840,224,960,224,1080,192C1200,160,1320,96,1380,64L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
      </svg>
    </div>
  );
}
