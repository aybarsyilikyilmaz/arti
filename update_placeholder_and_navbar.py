# 1. Update PlaceholderSection.jsx (Clear texts and add data-theme="dark")
new_placeholder = """import React from 'react';

export default function PlaceholderSection() {
  return (
    <div className="relative w-full h-screen bg-brand overflow-hidden flex items-center justify-center border-t border-brand-dark/20" data-theme="dark">
      {/* Background Gradient & Overlay identical to Hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-brand-dark"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-300/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-green-400/10 rounded-full blur-3xl"></div>
      
      {/* Completely empty canvas as requested, waiting for content */}
      <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
      </div>
    </div>
  );
}
"""

with open('frontend/src/components/PlaceholderSection.jsx', 'w', encoding='utf-8') as f:
    f.write(new_placeholder)

# 2. Update App.jsx logic for dynamic navbar styling
with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

old_scroll_logic = """  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textColor = isScrolled ? 'text-gray-800' : 'text-white';
  const hoverColor = isScrolled ? 'hover:text-brand' : 'hover:text-green-200';
  const logoColor = isScrolled ? 'text-gray-900' : 'text-white';
  const btnStyle = isScrolled 
    ? 'bg-gray-900 text-white hover:bg-gray-800' 
    : 'bg-white text-brand-dark hover:bg-gray-100';
  const dividerColor = isScrolled ? 'text-gray-300' : 'text-white/40';"""

new_scroll_logic = """  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkHeader, setIsDarkHeader] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Dynamically detect if the header is currently floating over a dark green section
      const elementAtHeader = document.elementFromPoint(window.innerWidth / 2, 32);
      if (elementAtHeader) {
        const isOverDark = !!elementAtHeader.closest('.bg-brand, .bg-brand-dark, [data-theme="dark"]');
        setIsDarkHeader(isOverDark);
      } else {
        setIsDarkHeader(window.scrollY < 20);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const useWhiteText = !isScrolled || isDarkHeader;

  const textColor = useWhiteText ? 'text-white' : 'text-gray-800';
  const hoverColor = useWhiteText ? 'hover:text-green-200' : 'hover:text-brand';
  const logoColor = useWhiteText ? 'text-white' : 'text-gray-900';
  const btnStyle = useWhiteText 
    ? 'bg-white text-brand-dark hover:bg-gray-100' 
    : 'bg-gray-900 text-white hover:bg-gray-800';
  const dividerColor = useWhiteText ? 'text-white/40' : 'text-gray-300';"""

app_content = app_content.replace(old_scroll_logic, new_scroll_logic)

# Replace the <nav> container class line in App.jsx
old_nav_class = """      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200' : 'bg-transparent'}`}>"""
new_nav_class = """      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        !isScrolled 
          ? 'bg-transparent' 
          : isDarkHeader 
            ? 'bg-brand-dark/30 backdrop-blur-md border-b border-white/10' 
            : 'bg-white/90 backdrop-blur-md border-b border-gray-200'
      }`}>"""

app_content = app_content.replace(old_nav_class, new_nav_class)

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Successfully updated both placeholder section and the dynamic navbar header theme logic!")
