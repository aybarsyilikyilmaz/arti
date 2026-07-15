import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
    <svg viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Right branch */}
      <path d="M45 42 C 55 42, 70 38, 85 25" />
      <path d="M52 41 C 51 32, 57 24, 63 26 C 63 32, 58 39, 52 41 Z" />
      <path d="M65 37 C 66 26, 73 20, 80 23 C 78 30, 71 36, 65 37 Z" />
      <path d="M78 31 C 82 23, 89 18, 93 22 C 90 27, 83 31, 78 31 Z" />
      <path d="M58 40 C 66 43, 74 42, 77 36 C 72 34, 64 36, 58 40 Z" />
      <path d="M72 34 C 80 36, 88 34, 90 28 C 85 27, 77 30, 72 34 Z" />
      <path d="M60 33 L 66 22" />
      <circle cx="66" cy="22" r="2.5" fill="currentColor" />
      <path d="M74 27 L 80 16" />
      <circle cx="80" cy="16" r="2.5" fill="currentColor" />

      {/* Left branch */}
      <path d="M55 42 C 45 42, 30 46, 15 50" />
      <path d="M48 43 C 49 52, 43 60, 37 58 C 37 52, 42 45, 48 43 Z" />
      <path d="M35 45 C 34 56, 27 62, 20 59 C 22 52, 29 46, 35 45 Z" />
      <path d="M22 47 C 18 57, 11 62, 7 58 C 10 53, 17 49, 22 47 Z" />
      <path d="M42 44 C 34 41, 26 42, 23 48 C 28 50, 36 48, 42 44 Z" />
      <path d="M28 47 C 20 45, 12 47, 10 53 C 15 54, 23 51, 28 47 Z" />
      <path d="M40 50 L 34 61" />
      <circle cx="34" cy="61" r="2.5" fill="currentColor" />
      <path d="M26 53 L 20 64" />
      <circle cx="20" cy="64" r="2.5" fill="currentColor" />
    </svg>
  );
}

function App() {
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
    <Router>
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
              <Link to="/" className={`flex items-center space-x-1.5 ${textColor} ${hoverColor} transition font-normal text-[15px]`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Çevrendekiler</span>
              </Link>
              <Link to="/" className={`${textColor} ${hoverColor} transition font-normal text-[15px] hidden md:block`}>Hakkımızda</Link>
              <Link to="/business" className={`${textColor} ${hoverColor} transition font-normal text-[15px] hidden md:block`}>İşletme</Link>
            </div>

            {/* Center Logo */}
            <div className="flex justify-center flex-1">
              <Link to="/" className={`font-bold ${logoColor} flex items-center justify-center transition-colors`} aria-label="Anasayfa">
                <LogoIcon className="h-10 w-auto" />
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center justify-end space-x-5 flex-1 text-[15px] font-normal">
              <div className="hidden lg:flex items-center space-x-4">
                <Link to="/business" className={`${textColor} ${hoverColor} transition`}>İşletme kaydı</Link>
                <span className={`${dividerColor} transition-colors`}>|</span>
                <Link to="/business" className={`${textColor} ${hoverColor} transition`}>Mağaza girişi</Link>
              </div>
              <a href="#download" className={`${btnStyle} px-5 py-2.5 rounded-full font-medium transition whitespace-nowrap`}>
                Uygulamayı indir
              </a>
              <button className={`${textColor} ${hoverColor} transition hidden sm:block font-medium`}>TR</button>
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
        <Footer />
      </div>
    </Router>
  );
}

export default App;
