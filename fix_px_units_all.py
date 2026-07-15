import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update HTML inline styles to have px units
old_html = """            <!-- Loader circle with inline CSS variables and defaults -->
            <circle class="loader-circle" cx="50" cy="50" r="40" stroke="#388E3C" stroke-width="5" fill="none" stroke-linecap="round" 
                    style="stroke-dasharray: 251; stroke-dashoffset: 251; transform: rotate(-90deg); transform-origin: 50px 50px;" />
            <!-- Checkmark with inline CSS variables and defaults -->
            <path class="checkmark-path" d="M35 50 l10 10 l20 -20" stroke="#388E3C" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" 
                  style="stroke-dasharray: 50; stroke-dashoffset: 50;" />"""

new_html = """            <!-- Loader circle with inline CSS variables and defaults -->
            <circle class="loader-circle" cx="50" cy="50" r="40" stroke="#388E3C" stroke-width="5" fill="none" stroke-linecap="round" 
                    style="stroke-dasharray: 251px; stroke-dashoffset: 251px; transform: rotate(-90deg); transform-origin: 50px 50px;" />
            <!-- Checkmark with inline CSS variables and defaults -->
            <path class="checkmark-path" d="M35 50 l10 10 l20 -20" stroke="#388E3C" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" 
                  style="stroke-dasharray: 50px; stroke-dashoffset: 50px;" />"""

content = content.replace(old_html, new_html)

# 2. Update JS code to use px units
old_js = """  function confirmPayment() {
    goTo(5); // Go to loading screen
    
    const loaderCircle = document.querySelector('.loader-circle');
    const checkmarkPath = document.querySelector('.checkmark-path');
    const loadingText = document.getElementById('loading-text');
    
    // Reset state inline immediately
    loaderCircle.style.transition = 'none';
    loaderCircle.style.strokeDashoffset = '251';
    checkmarkPath.style.transition = 'none';
    checkmarkPath.style.strokeDashoffset = '50';
    loadingText.textContent = 'Ödeme alınıyor...';
    
    // Force a browser reflow so it recognizes the reset values
    loaderCircle.getBoundingClientRect();
    
    // Trigger animation after screen becomes visible (200ms)
    setTimeout(() => {
      // Start circle loading transition (1.8s)
      loaderCircle.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)';
      loaderCircle.style.strokeDashoffset = '0';
      
      // After 1.8s (circle full)
      setTimeout(() => {
        // Start checkmark drawing transition (0.4s)
        checkmarkPath.style.transition = 'stroke-dashoffset 0.4s ease-out';
        checkmarkPath.style.strokeDashoffset = '0';
        loadingText.textContent = 'Ödeme onaylandı!';
        
        // Go to screen 6 after checkmark shows (1.2s)
        setTimeout(() => {
          goTo(6);
        }, 1200);
      }, 1800);
    }, 200);
  }"""

new_js = """  function confirmPayment() {
    goTo(5); // Go to loading screen
    
    const loaderCircle = document.querySelector('.loader-circle');
    const checkmarkPath = document.querySelector('.checkmark-path');
    const loadingText = document.getElementById('loading-text');
    
    // Reset state inline immediately
    loaderCircle.style.transition = 'none';
    loaderCircle.style.strokeDashoffset = '251px';
    checkmarkPath.style.transition = 'none';
    checkmarkPath.style.strokeDashoffset = '50px';
    loadingText.textContent = 'Ödeme alınıyor...';
    
    // Force a browser reflow so it recognizes the reset values
    loaderCircle.getBoundingClientRect();
    
    // Trigger animation after screen becomes visible (200ms)
    setTimeout(() => {
      // Start circle loading transition (1.8s)
      loaderCircle.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)';
      loaderCircle.style.strokeDashoffset = '0px';
      
      // After 1.8s (circle full)
      setTimeout(() => {
        // Start checkmark drawing transition (0.4s)
        checkmarkPath.style.transition = 'stroke-dashoffset 0.4s ease-out';
        checkmarkPath.style.strokeDashoffset = '0px';
        loadingText.textContent = 'Ödeme onaylandı!';
        
        // Go to screen 6 after checkmark shows (1.2s)
        setTimeout(() => {
          goTo(6);
        }, 1200);
      }, 1800);
    }, 200);
  }"""

content = content.replace(old_js, new_js)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
