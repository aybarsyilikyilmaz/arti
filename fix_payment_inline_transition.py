import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the payment loader CSS from <style> to prevent any conflicts
css_pattern = r"""  /\* Payment Loader Animation \*/
  \.payment-loader \{
    display: block;
    margin: 0 auto 2rem;
  \}
  \.loader-circle \{
    stroke-dasharray: 251px;
    stroke-dashoffset: 251px;
    transform: rotate\(-90deg\);
    transform-origin: 50px 50px;
  \}
  \.checkmark-path \{
    stroke-dasharray: 50px;
    stroke-dashoffset: 50px;
  \}
  \.payment-loader\.loading \.loader-circle \{
    animation: loadProgress 1\.8s cubic-bezier\(0\.4, 0, 0\.2, 1\) forwards;
  \}
  \.payment-loader\.success \.loader-circle \{
    stroke-dashoffset: 0;
    stroke: #388E3C;
  \}
  \.payment-loader\.success \.checkmark-path \{
    animation: drawCheck 0\.5s ease-in-out 0\.1s forwards;
    stroke: #388E3C;
  \}
  @keyframes loadProgress \{
    0% \{ stroke-dashoffset: 251px; \}
    100% \{ stroke-dashoffset: 0px; \}
  \}
  @keyframes drawCheck \{
    0% \{ stroke-dashoffset: 50px; \}
    100% \{ stroke-dashoffset: 0px; \}
  \}"""

content = re.sub(css_pattern, "", content)

# Also ensure simple css for payment-loader layout is in stylesheet
content = content.replace('</style>', '  .payment-loader { display: block; margin: 0 auto 2rem; }\n</style>')

# 2. Update screen-5 HTML to use inline styles for animation properties
old_screen5 = """      <!-- ============ SCREEN 5 — Ödeme alınıyor (Loader) ============ -->
      <section class="screen" id="screen-5" style="background: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div style="text-align: center;">
          <svg class="payment-loader" width="100" height="100" viewBox="0 0 100 100">
            <!-- Background circle -->
            <circle cx="50" cy="50" r="40" stroke="#f5f5f5" stroke-width="5" fill="none" />
            <!-- Loader circle -->
            <circle class="loader-circle" cx="50" cy="50" r="40" stroke="#388E3C" stroke-width="5" fill="none" stroke-linecap="round" />
            <!-- Checkmark -->
            <path class="checkmark-path" d="M35 50 l10 10 l20 -20" stroke="#388E3C" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <h3 id="loading-text" style="font-size: 1.25rem; font-weight: 700; color: #111; margin: 0;">Ödeme alınıyor...</h3>
        </div>
      </section>"""

new_screen5 = """      <!-- ============ SCREEN 5 — Ödeme alınıyor (Loader) ============ -->
      <section class="screen" id="screen-5" style="background: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div style="text-align: center;">
          <svg class="payment-loader" width="100" height="100" viewBox="0 0 100 100">
            <!-- Background circle -->
            <circle cx="50" cy="50" r="40" stroke="#f5f5f5" stroke-width="5" fill="none" />
            <!-- Loader circle with inline CSS variables and defaults -->
            <circle class="loader-circle" cx="50" cy="50" r="40" stroke="#388E3C" stroke-width="5" fill="none" stroke-linecap="round" 
                    style="stroke-dasharray: 251; stroke-dashoffset: 251; transform: rotate(-90deg); transform-origin: 50px 50px;" />
            <!-- Checkmark with inline CSS variables and defaults -->
            <path class="checkmark-path" d="M35 50 l10 10 l20 -20" stroke="#388E3C" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" 
                  style="stroke-dasharray: 50; stroke-dashoffset: 50;" />
          </svg>
          <h3 id="loading-text" style="font-size: 1.25rem; font-weight: 700; color: #111; margin: 0;">Ödeme alınıyor...</h3>
        </div>
      </section>"""

content = content.replace(old_screen5, new_screen5)

# 3. Update confirmPayment JS function to trigger inline transitions
old_js = """  function confirmPayment() {
    goTo(5); // Go to loading screen
    const loader = document.querySelector('.payment-loader');
    const loadingText = document.getElementById('loading-text');
    
    // Reset state
    loader.className = 'payment-loader';
    loadingText.textContent = 'Ödeme alınıyor...';
    
    // Trigger animation after screen becomes visible (200ms)
    setTimeout(() => {
      loader.className = 'payment-loader loading';
      
      // After 1.8s
      setTimeout(() => {
        loader.className = 'payment-loader success';
        loadingText.textContent = 'Ödeme onaylandı!';
        
        // Go to screen 6 after checkmark shows
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

content = content.replace(old_js, new_js)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
