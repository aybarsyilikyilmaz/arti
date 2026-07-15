import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add CSS for payment loader to stylesheet (we'll insert it near the end of style tag)
css_insert = """
  /* Payment Loader Animation */
  .payment-loader {
    display: block;
    margin: 0 auto 2rem;
  }
  .loader-circle {
    stroke-dasharray: 251;
    stroke-dashoffset: 251;
    transform: rotate(-90deg);
    transform-origin: 50px 50px;
    transition: stroke-dashoffset 0.1s ease;
  }
  .checkmark-path {
    stroke-dasharray: 50;
    stroke-dashoffset: 50;
  }
  .payment-loader.loading .loader-circle {
    animation: loadProgress 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  .payment-loader.success .loader-circle {
    stroke-dashoffset: 0;
    stroke: #388E3C;
  }
  .payment-loader.success .checkmark-path {
    animation: drawCheck 0.5s ease-in-out 0.1s forwards;
    stroke: #388E3C;
  }
  @keyframes loadProgress {
    0% { stroke-dashoffset: 251; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes drawCheck {
    0% { stroke-dashoffset: 50; }
    100% { stroke-dashoffset: 0; }
  }
</style>"""

content = content.replace('</style>', css_insert)

# Replace the Onayla button on Screen 4 to trigger confirmPayment() instead of goTo(5)
content = content.replace('onclick="goTo(5)"', 'onclick="confirmPayment()"')

# Replace the confirm screen section (current screen-5) with loading screen (screen-5) and confirmation screen (screen-6)
screen5_search = r"""      <!-- ============ SCREEN 5 — Onay ============ -->
      <section class="screen" id="screen-5" style="background: #fafafa; display: flex; flex-direction: column;">
        
        <div class="screen-body" style="padding: 3rem 1.5rem 2rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; align-items: center;">
          
          <!-- Top Icon -->
          <div style="width: 72px; height: 72px; border-radius: 50%; border: 6px solid #1E8E7D; display: flex; align-items: center; justify-content: center; margin-bottom: 1.2rem;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1E8E7D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          
          <!-- Titles -->
          <h2 style="margin: 0 0 0.5rem; font-size: 1.6rem; font-weight: 800; color: #111; text-align: center;">Siparişiniz Alındı!</h2>
          <p style="margin: 0 0 2rem; font-size: 1rem; color: #555; text-align: center;">Bir sürpriz kutuyu kurtardığınız için teşekkürler!</p>

          <!-- Main Card -->
          <div style="background: #fff; border-radius: 16px; padding: 1.5rem; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f0f0f0;">
            <h3 style="margin: 0 0 1.5rem; font-size: 1.1rem; font-weight: 700; color: #111; text-align: center;">Teslim Alma Detayları</h3>
            
            <div style="display: flex; justify-content: center; margin-bottom: 1.5rem;">
              <!-- Using the existing canvas for the QR code -->
              <canvas id="qr-canvas" width="160" height="160" style="border: 4px solid #fff; outline: 1px solid #eee; padding: 4px; box-sizing: border-box;"></canvas>
            </div>
            
            <p style="margin: 0 0 1.5rem; font-size: 0.85rem; font-weight: 700; color: #333; text-align: center; letter-spacing: 0.5px;">TESLİM ALMA KODU: ARTI2024</p>
            
            <p style="margin: 0 0 0.3rem; font-size: 1.05rem; font-weight: 700; color: #111; text-align: center;">Manolya Cafe - Kadıköy, İstanbul</p>
            <p style="margin: 0 0 1.5rem; font-size: 0.95rem; color: #555; text-align: center;">Bugün teslim alın 18:00 - 18:30</p>
            
            <!-- Map box -->
            <div style="position: relative; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0;">
              <!-- Fake map image background -->
              <div style="width: 100%; height: 110px; background-color: #f0f5f1; background-image: url\('data:image/svg\+xml;utf8,<svg viewBox='0 0 400 120' xmlns='http://www.w3.org/2000/svg'><path d='M0 40 Q200 -20 400 60' stroke='%23fff' stroke-width='16' fill='none'/><path d='M100 120 L250 0' stroke='%23fff' stroke-width='16' fill='none'/><path d='M0 40 Q200 -20 400 60' stroke='%23d5e2da' stroke-width='12' fill='none'/><path d='M100 120 L250 0' stroke='%23d5e2da' stroke-width='12' fill='none'/><path d='M-50 80 L450 60' stroke='%23fff' stroke-width='16' fill='none'/><path d='M-50 80 L450 60' stroke='%23d5e2da' stroke-width='12' fill='none'/></svg>'\); position: relative;">
                <!-- Map Pin -->
                <div style="position: absolute; top: 45%; left: 50%; transform: translate\(-50%, -100%\);">
                  <div style="background: #1E8E7D; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate\(-45deg\); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba\(0,0,0,0.3\);">
                    <div style="width: 12px; height: 12px; background: #fff; border-radius: 50%; transform: rotate\(45deg\);"></div>
                  </div>
                </div>
              </div>
              <div style="position: absolute; top: 50%; left: 50%; transform: translate\(-50%, -50%\); font-weight: 700; font-size: 0.85rem; color: #222; text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;">Manolya Cafe</div>
              <div style="position: absolute; bottom: 10px; left: 10px; display: flex; align-items: center; gap: 4px; font-weight: bold; font-size: 0.75rem; color: #555;"><svg width="12" height="12" viewBox="0 0 24 24" fill='currentColor'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z'/></svg> Harita</div>
            </div>
            <button style="width: 100%; background: #f9f9f9; border: none; padding: 1rem; font-weight: 700; font-size: 1rem; color: #222; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-top: 1px solid #e0e0e0;">
              Yol Tarifi Al
              <svg width="18" height="18" viewBox="0 0 24 24" fill='none' stroke="#666" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          
        </div>

        <!-- Sticky Bottom Actions -->
        <div style="padding: 1rem 1.5rem 2rem; background: #fafafa; display: flex; gap: 1rem;">
          <button style="flex: 1; background: transparent; color: #1E8E7D; border: 2px solid #1E8E7D; padding: 1.1rem 0; border-radius: 999px; font-weight: 700; font-size: 1.05rem; cursor: pointer; white-space: nowrap;">
            Takvime Ekle
          </button>
          <button onclick="goTo\(0\)" style="flex: 1; background: #1E8E7D; color: #fff; border: 2px solid #1E8E7D; padding: 1.1rem 0; border-radius: 999px; font-weight: 700; font-size: 1.05rem; cursor: pointer; white-space: nowrap;">
            Ana Sayfaya Dön
          </button>
        </div>
      </section>"""

screens_replacement = """      <!-- ============ SCREEN 5 — Ödeme alınıyor (Loader) ============ -->
      <section class="screen" id="screen-5" style="background: #fff; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div style="text-align: center;">
          <svg class="payment-loader" width="100" height="100" viewBox="0 0 100 100">
            <!-- Background circle -->
            <circle cx="50" cy="50" r="40" stroke="#f5f5f5" stroke-width="5" fill="none" />
            <!-- Loader circle -->
            <circle class="loader-circle" cx="50" cy="50" r="40" stroke="#388E3C" stroke-width="5" fill="none" stroke-linecap="round" />
            <!-- Checkmark -->
            <path class="checkmark-path" d="M35 50 l10 10 l20 -20" stroke="transparent" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <h3 id="loading-text" style="font-size: 1.25rem; font-weight: 700; color: #111; margin: 0;">Ödeme alınıyor...</h3>
        </div>
      </section>

      <!-- ============ SCREEN 6 — Onay ============ -->
      <section class="screen" id="screen-6" style="background: #fafafa; display: flex; flex-direction: column;">
        
        <div class="screen-body" style="padding: 3.5rem 1.5rem 2rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; align-items: center;">
          
          <!-- Top Icon -->
          <div style="width: 72px; height: 72px; border-radius: 50%; border: 6px solid #1E8E7D; display: flex; align-items: center; justify-content: center; margin-bottom: 1.2rem;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1E8E7D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          
          <!-- Titles -->
          <h2 style="margin: 0 0 0.5rem; font-size: 1.6rem; font-weight: 800; color: #111; text-align: center;">Siparişiniz Alındı!</h2>
          <p style="margin: 0 0 2rem; font-size: 1rem; color: #555; text-align: center;">Bir sürpriz kutuyu kurtardığınız için teşekkürler!</p>

          <!-- Main Card -->
          <div style="background: #fff; border-radius: 16px; padding: 1.5rem; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f0f0f0;">
            <h3 style="margin: 0 0 1.5rem; font-size: 1.1rem; font-weight: 700; color: #111; text-align: center;">Teslim Alma Detayları</h3>
            
            <div style="display: flex; justify-content: center; margin-bottom: 1.5rem;">
              <canvas id="qr-canvas" width="160" height="160" style="border: 4px solid #fff; outline: 1px solid #eee; padding: 4px; box-sizing: border-box;"></canvas>
            </div>
            
            <p style="margin: 0 0 1.5rem; font-size: 0.85rem; font-weight: 700; color: #333; text-align: center; letter-spacing: 0.5px;">TESLİM ALMA KODU: ARTI2024</p>
            
            <p style="margin: 0 0 0.3rem; font-size: 1.05rem; font-weight: 700; color: #111; text-align: center;">Manolya Cafe - Kadıköy, İstanbul</p>
            <p style="margin: 0 0 1.5rem; font-size: 0.95rem; color: #555; text-align: center;">Bugün teslim alın 18:00 - 18:30</p>
            
            <!-- Map box -->
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
              </div>
              <button style="width: 100%; background: #f9f9f9; border: none; padding: 1rem; font-weight: 700; font-size: 1rem; color: #222; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-top: 1px solid #e0e0e0;">
                Yol Tarifi Al
                <svg width="18" height="18" viewBox="0 0 24 24" fill='none' stroke="#666" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            
          </div>
          
        </div>

        <!-- Sticky Bottom Actions -->
        <div style="padding: 1rem 1.5rem 2rem; background: #fafafa; display: flex; gap: 1rem;">
          <button onclick="goTo(0)" style="width: 100%; background: #1E8E7D; color: #fff; border: none; padding: 1.25rem 0; border-radius: 999px; font-weight: 700; font-size: 1.1rem; cursor: pointer; white-space: nowrap; transition: transform 0.1s;" onmousedown="this.style.transform='scale(0.97)';" onmouseup="this.style.transform='scale(1)';">
            Ana Sayfaya Dön
          </button>
        </div>
      </section>"""

content = re.sub(screen5_search, screens_replacement, content, flags=re.DOTALL)

# Update the labels array in JS to contain 7 screens
labels_search = r"""  const labels = \[
    'Konum ve mesafe',
    'Harita \+ yakında',
    'Tam liste',
    'Mağaza detayı',
    'Rezervasyon / ödeme',
    'Onay',
  \];"""

labels_replace = """  const labels = [
    'Konum ve mesafe',
    'Harita + yakında',
    'Tam liste',
    'Mağaza detayı',
    'Rezervasyon / ödeme',
    'Ödeme alınıyor',
    'Onay',
  ];"""

content = re.sub(labels_search, labels_replace, content)

# Inject the confirmPayment script inside <script> tag
script_insert = """
  function confirmPayment() {
    goTo(5); // Go to loading screen
    const loader = document.querySelector('.payment-loader');
    const loadingText = document.getElementById('loading-text');
    
    // Reset state
    loader.className = 'payment-loader loading';
    loadingText.textContent = 'Ödeme alınıyor...';
    
    // After 1.8s
    setTimeout(() => {
      loader.className = 'payment-loader success';
      loadingText.textContent = 'Ödeme onaylandı!';
      
      // Go to screen 6 after checkmark shows
      setTimeout(() => {
        goTo(6);
      }, 1000);
    }, 1800);
  }
"""

content = content.replace('  function goTo(index) {', script_insert + '\n  function goTo(index) {')

# Modify goTo to hide dots controls on screens 5 and 6 (index >= 5)
goto_search = r"""    setTimeout\(\(\) => \{
      screens\[current\]\.classList\.remove\('active'\);
      current = \(index \+ screens\.length\) % screens\.length;
      screens\[current\]\.classList\.add\('active'\);
      \[\.\.\.dotsWrap\.children\]\.forEach\(\(d, i\) => d\.classList\.toggle\('on', i === current\)\);
      label\.textContent = \(current \+ 1\) \+ ' / ' \+ screens\.length \+ ' — ' \+ labels\[current\];"""

goto_replace = """    setTimeout(() => {
      screens[current].classList.remove('active');
      current = (index + screens.length) % screens.length;
      screens[current].classList.add('active');
      [...dotsWrap.children].forEach((d, i) => d.classList.toggle('on', i === current));
      label.textContent = (current + 1) + ' / ' + screens.length + ' — ' + labels[current];
      
      // Hide controls/dots for loading and confirmation screens (index >= 5)
      const controls = document.querySelector('.controls');
      const screenLabel = document.getElementById('screen-label');
      if (current >= 5) {
        if (controls) controls.style.display = 'none';
        if (screenLabel) screenLabel.style.display = 'none';
      } else {
        if (controls) controls.style.display = 'flex';
        if (screenLabel) screenLabel.style.display = 'block';
      }"""

content = re.sub(goto_search, goto_replace, content)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
