import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import BusinessAuth from './components/BusinessAuth';
import PartnersStrip from './components/PartnersStrip';
import Testimonials from './components/Testimonials';
import PlaceholderSection from './components/PlaceholderSection';
import FAQ from './components/FAQ';
import DownloadCTA from './components/DownloadCTA';
import Footer from './components/Footer';

function HomePage() {
  return (
    <>
      <Hero />
      <PartnersStrip />
      <InfoSection />
      <PlaceholderSection />
      <Testimonials />
      <FAQ />
      <DownloadCTA />
    </>
  );
}

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

function App() {
  const location = useLocation();
  const isBusinessPage = location.pathname.startsWith('/business');
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkHeader, setIsDarkHeader] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Foolproof intersection detection using getBoundingClientRect()
      // Checks if the middle of the floating header (y = 32px) intersects any dark green section
      const darkSections = document.querySelectorAll('.bg-brand, .bg-brand-dark, [data-theme="dark"]');
      let isOverDark = false;
      
      darkSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 32 && rect.bottom >= 32) {
          isOverDark = true;
        }
      });
      
      setIsDarkHeader(isOverDark);
    };
    window.addEventListener('scroll', handleScroll);
    // Run once on load to establish correct state
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const useWhiteText = !isScrolled || isDarkHeader;

  const textColor = useWhiteText ? 'text-white' : 'text-gray-800';
  const hoverColor = useWhiteText ? 'hover:text-green-200' : 'hover:text-brand';
  const logoColor = useWhiteText ? 'text-white' : 'text-brand';
  const btnStyle = useWhiteText 
    ? 'bg-white text-brand-dark hover:bg-gray-100' 
    : 'bg-gray-900 text-white hover:bg-gray-800';
  const dividerColor = useWhiteText ? 'text-white/40' : 'text-gray-300';
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        !isScrolled 
          ? 'bg-transparent' 
          : isDarkHeader 
            ? 'bg-brand-dark/30 backdrop-blur-md border-b border-white/10' 
            : 'bg-white/90 backdrop-blur-md border-b border-gray-200'
      }`}>
        <div className="px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Side */}
            <div className="flex items-center space-x-6 flex-1">
              {isBusinessPage ? (
                <Link to="/" className={`flex items-center space-x-1.5 ${textColor} ${hoverColor} transition font-normal text-[15px]`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Anasayfaya Dön</span>
                </Link>
              ) : (
                <>
                  <Link to="/" className={`flex items-center space-x-1.5 ${textColor} ${hoverColor} transition font-normal text-[15px]`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Çevrendekiler</span>
                  </Link>
                  <Link to="/" className={`${textColor} ${hoverColor} transition font-normal text-[15px] hidden md:block`}>Hakkımızda</Link>
                  <Link to="/business" className={`${textColor} ${hoverColor} transition font-normal text-[15px] hidden md:block`}>İşletme</Link>
                </>
              )}
            </div>

            {/* Center Logo */}
            <div className="flex justify-center flex-1">
              <Link to="/" className={`${logoColor} flex items-center justify-center gap-1.5 transition-colors`} aria-label="Anasayfa">
                <LogoIcon className="h-9 w-auto" />
                <span className="font-logo italic font-semibold text-3xl tracking-wide pt-0.5 select-none">Artı</span>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center justify-end space-x-5 flex-1 text-[15px] font-normal">
              {!isBusinessPage && (
                <>
                  <div className="hidden lg:flex items-center space-x-4">
                    <Link to="/business" className={`${textColor} ${hoverColor} transition`}>İşletme kaydı</Link>
                    <span className={`${dividerColor} transition-colors`}>|</span>
                    <Link to="/business" className={`${textColor} ${hoverColor} transition`}>Mağaza girişi</Link>
                  </div>
                  <a href="#download" className={`${btnStyle} px-5 py-2.5 rounded-full font-medium transition whitespace-nowrap`}>
                    Uygulamayı indir
                  </a>
                  <button className={`${textColor} ${hoverColor} transition hidden sm:block font-medium`}>TR</button>
                </>
              )}
            </div>

          </div>
        </div>
      </nav>

        {/* Dynamic Route Content */}
        <main className="flex-grow relative z-10 bg-white shadow-[0_15px_35px_rgba(0,0,0,0.15)]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/business" element={<BusinessAuth />} />
          </Routes>
        </main>

        {/* Footer */}
        {!isBusinessPage && <Footer />}
      </div>
  );
}

export default App;
