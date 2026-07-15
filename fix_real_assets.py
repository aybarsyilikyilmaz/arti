import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Include QRious JS library via CDN before the Leaflet script
leaflet_cdn = '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>'
qrious_cdn = '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>\n<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>'
content = content.replace(leaflet_cdn, qrious_cdn)

# 2. Update screen-6 HTML to use the static map image and add ID to code display
old_map_box = """            <!-- Map box -->
            <div style="position: relative; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0;">
              <!-- Fake map image background -->
              <div style="width: 100%; height: 110px; background-color: #f0f5f1; background-image: url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 400 120\\' xmlns=\\'http://www.w3.org/2000/svg\\'><path d=\\'M0 40 Q200 -20 400 60\\' stroke=\\'%23fff\\' stroke-width=\\'16\\' fill=\\'none\\'/><path d=\\'M100 120 L250 0\\' stroke=\\'%23fff\\' stroke-width=\\'16\\' fill=\\'none\\'/><path d=\\'M0 40 Q200 -20 400 60\\' stroke=\\'%23d5e2da\\' stroke-width=\\'12\\' fill=\\'none\\'/><path d=\\'M100 120 L250 0\\' stroke=\\'%23d5e2da\\' stroke-width=\\'12\\' fill=\\'none\\'/><path d=\\'M-50 80 L450 60\\' stroke=\\'%23fff\\' stroke-width=\\'16\\' fill=\\'none\\'/><path d=\\'M-50 80 L450 60\\' stroke=\\'%23d5e2da\\' stroke-width=\\'12\\' fill=\\'none\\'/></svg>'); position: relative;">
                <!-- Map Pin -->
                <div style="position: absolute; top: 45%; left: 50%; transform: translate(-50%, -100%);">
                  <div style="background: #1E8E7D; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                    <div style="width: 12px; height: 12px; background: #fff; border-radius: 50%; transform: rotate(45deg);"></div>
                  </div>
                </div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: 700; font-size: 0.85rem; color: #222; text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;">Manolya Cafe</div>
                <div style="position: absolute; bottom: 10px; left: 10px; display: flex; align-items: center; gap: 4px; font-weight: bold; font-size: 0.75rem; color: #555;"><svg width="12" height="12" viewBox="0 0 24 24" fill='currentColor'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z'/></svg> Harita</div>
              </div>"""

new_map_box = """            <!-- Map box -->
            <div style="position: relative; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0;">
              <!-- Real Map screenshot -->
              <div style="width: 100%; height: 130px; background-image: url('kadikoy_map_static.jpg'); background-size: cover; background-position: center; position: relative;">
                <div style="position: absolute; bottom: 8px; left: 8px; display: flex; align-items: center; gap: 4px; font-weight: bold; font-size: 0.75rem; color: #333; background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.15);"><svg width="12" height="12" viewBox="0 0 24 24" fill='currentColor'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z'/></svg> Harita</div>
              </div>"""

content = content.replace(old_map_box, new_map_box)

# 3. Add dynamic ID to code text
old_code_text = '<p style="margin: 0 0 1.5rem; font-size: 0.85rem; font-weight: 700; color: #333; text-align: center; letter-spacing: 0.5px;">TESLİM ALMA KODU: ARTI2024</p>'
new_code_text = '<p id="pickup-code-display" style="margin: 0 0 1.5rem; font-size: 0.95rem; font-weight: 800; color: #1E8E7D; text-align: center; letter-spacing: 0.5px;">TESLİM ALMA KODU: AR-8492</p>'
content = content.replace(old_code_text, new_code_text)

# 4. Update confirmPayment JS function to generate real QR and real random code
old_confirm_payment = """  function confirmPayment() {
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

new_confirm_payment = """  function confirmPayment() {
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
        
        // Generate real random pickup code
        const randomCode = 'AR-' + Math.floor(1000 + Math.random() * 9000);
        document.getElementById('pickup-code-display').textContent = 'TESLİM ALMA KODU: ' + randomCode;
        
        // Generate REAL QR Code using QRious library on the canvas
        new QRious({
          element: document.getElementById('qr-canvas'),
          value: 'https://artiapp.com/order/' + randomCode,
          size: 160,
          background: '#ffffff',
          foreground: '#21261f',
          level: 'H'
        });
        
        // Go to screen 6 after checkmark shows (1.2s)
        setTimeout(() => {
          goTo(6);
        }, 1200);
      }, 1800);
    }, 200);
  }"""

content = content.replace(old_confirm_payment, new_confirm_payment)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
