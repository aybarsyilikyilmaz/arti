with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Replace the scroll logic with the foolproof getBoundingClientRect() intersection logic
old_scroll_logic = """  useEffect(() => {
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
  }, []);"""

new_scroll_logic = """  useEffect(() => {
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
  }, []);"""

app_content = app_content.replace(old_scroll_logic, new_scroll_logic)

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Successfully replaced navbar dynamic theme detection with getBoundingClientRect intersection check!")
