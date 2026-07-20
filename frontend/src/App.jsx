import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './pages/admin/AdminLayout';
import BusinessApprovals from './pages/admin/BusinessApprovals';
import AdminBusinessCreate from './pages/admin/AdminBusinessCreate';
import BusinessDetail from './pages/admin/BusinessDetail';
import AdminTickets from './pages/admin/AdminTickets';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFinance from './pages/admin/AdminFinance';
import AdminReviews from './pages/admin/AdminReviews';
import BusinessLayout from './pages/business/BusinessLayout';
import Overview from './pages/business/Overview';
import OrdersPage from './pages/business/OrdersPage';
import BoxManager from './pages/business/BoxManager';
import FinancePage from './pages/business/FinancePage';
import BusinessSettings from './pages/business/BusinessSettings';
import BusinessProfile from './pages/business/BusinessProfile';
import StorefrontEditor from './pages/business/StorefrontEditor';
import TeamManager from './pages/business/TeamManager';
import BusinessTickets from './pages/business/BusinessTickets';
import CustomerLayout from './pages/customer/CustomerLayout';
import Discover from './pages/customer/Discover';
import CustomerAuth from './pages/customer/CustomerAuth';
import BoxDetail from './pages/customer/BoxDetail';
import Checkout from './pages/customer/Checkout';
import MyOrders from './pages/customer/MyOrders';
import Favorites from './pages/customer/Favorites';
import CustomerProfile from './pages/customer/Profile';
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import BusinessAuth from './components/BusinessAuth';
import PartnersStrip from './components/PartnersStrip';
import Testimonials from './components/Testimonials';
import PlaceholderSection from './components/PlaceholderSection';
import FAQ from './components/FAQ';
import DownloadCTA from './components/DownloadCTA';
import Footer from './components/Footer';
import About from './components/About';
import BrandLogo from './components/BrandLogo';

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

function App() {
  const location = useLocation();
  const isBusinessPage = location.pathname.startsWith('/business');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isPanelPage = location.pathname.startsWith('/panel');
  const isCustomerPage = location.pathname.startsWith('/kesfet');
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkHeader, setIsDarkHeader] = useState(true);

  // Sayfa değişimlerinde scroll pozisyonunu en tepeye sıfırla (Scroll to Top)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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

  // Müşteri keşfet/sipariş uygulaması kendi kabuğunda (CustomerLayout) çalışır;
  // tanıtım sitesinin header/footer'ıyla asla karışmaz. Yemeksepeti tarzı akış:
  // keşfet → kutu detayı → mock ödeme → siparişlerim/QR.
  if (isCustomerPage) {
    return (
      <Routes>
        <Route path="/kesfet" element={<CustomerLayout />}>
          <Route index element={<Discover />} />
          <Route path="giris" element={<CustomerAuth />} />
          <Route path="kutu/:id" element={<BoxDetail />} />
          <Route path="odeme" element={<Checkout />} />
          <Route path="siparislerim" element={<MyOrders />} />
          <Route path="favoriler" element={<Favorites />} />
          <Route path="profil" element={<CustomerProfile />} />
        </Route>
      </Routes>
    );
  }

  // Admin ve işletme panelleri tanıtım sitesi kabuğundan (header/footer) bağımsızdır.
  // İşletme girişi/kaydı /business sihirbazından yapılır; /panel yalnızca panelin kendisidir.
  if (isAdminPage || isPanelPage) {
    return (
      <Routes>
        {/* Admin girişi ayrı sayfa değildir — tek kapı /business giriş formudur */}
        <Route path="/admin" element={<Navigate to="/business" state={{ mode: 'login' }} replace />} />
        <Route path="/admin/panel" element={<AdminLayout />}>
          <Route index element={<Navigate to="genel-bakis" replace />} />
          <Route path="genel-bakis" element={<AdminDashboard />} />
          <Route path="isletmeler" element={<BusinessApprovals />} />
          <Route path="isletmeler/yeni" element={<AdminBusinessCreate />} />
          <Route path="isletmeler/:id" element={<BusinessDetail />} />
          <Route path="siparisler" element={<AdminOrders />} />
          <Route path="kullanicilar" element={<AdminUsers />} />
          <Route path="finans" element={<AdminFinance />} />
          <Route path="yorumlar" element={<AdminReviews />} />
          <Route path="destek" element={<AdminTickets />} />
        </Route>
        <Route path="/panel" element={<BusinessLayout />}>
          <Route index element={<Navigate to="genel-bakis" replace />} />
          <Route path="genel-bakis" element={<Overview />} />
          <Route path="siparisler" element={<OrdersPage />} />
          <Route path="kutu" element={<BoxManager />} />
          <Route path="finans" element={<FinancePage />} />
          <Route path="vitrin" element={<StorefrontEditor />} />
          <Route path="ayarlar" element={<BusinessSettings />} />
          <Route path="profil" element={<BusinessProfile />} />
          <Route path="ekip" element={<TeamManager />} />
          <Route path="destek" element={<BusinessTickets />} />
        </Route>
      </Routes>
    );
  }

  const useWhiteText = (!isScrolled || isDarkHeader) && !isBusinessPage;

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
        isBusinessPage
          ? 'bg-white/90 backdrop-blur-md border-b border-gray-200'
          : !isScrolled 
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
                  <Link to="/kesfet" className={`flex items-center space-x-1.5 ${textColor} ${hoverColor} transition font-normal text-[15px]`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Çevrendekiler</span>
                  </Link>
                  <Link to="/about" className={`${textColor} ${hoverColor} transition font-normal text-[15px] hidden md:block`}>Hakkımızda</Link>
                  <Link to="/business" className={`${textColor} ${hoverColor} transition font-normal text-[15px] hidden md:block`}>İşletme</Link>
                </>
              )}
            </div>

            {/* Center Logo */}
            <div className="flex justify-center flex-1">
              <Link to="/" className={`${logoColor} flex items-center justify-center gap-1.5 transition-colors`} aria-label="Anasayfa">
                <BrandLogo className="h-9 w-auto" />
                <span className="font-logo italic font-semibold text-3xl tracking-wide pt-0.5 select-none">Artı</span>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center justify-end space-x-5 flex-1 text-[15px] font-normal">
              {!isBusinessPage && (
                <>
                  <div className="hidden lg:flex items-center space-x-4">
                    <Link to="/business" state={{ mode: 'register' }} className={`${textColor} ${hoverColor} transition`}>İşletme kaydı</Link>
                    <span className={`${dividerColor} transition-colors`}>|</span>
                    <Link to="/business" state={{ mode: 'login' }} className={`${textColor} ${hoverColor} transition`}>Mağaza girişi</Link>
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
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        {/* Footer */}
        {!isBusinessPage && <Footer />}
      </div>
  );
}

export default App;
