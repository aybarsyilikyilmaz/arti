import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace screen 5 back to the one from fix_screen5.py (but keep goTo(5) and leaf fixes on screen 4)
screen5_search = r"""      <!-- ============ SCREEN 5 — Onay ============ -->
      <section class="screen" id="screen-5".*?</section>"""

screen5_old = """      <!-- ============ SCREEN 5 — Onay ============ -->
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
              <div style="width: 100%; height: 110px; background-color: #f0f5f1; background-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 400 120\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0 40 Q200 -20 400 60\" stroke=\"%23fff\" stroke-width=\"16\" fill=\"none\"/><path d=\"M100 120 L250 0\" stroke=\"%23fff\" stroke-width=\"16\" fill=\"none\"/><path d=\"M0 40 Q200 -20 400 60\" stroke=\"%23d5e2da\" stroke-width=\"12\" fill=\"none\"/><path d=\"M100 120 L250 0\" stroke=\"%23d5e2da\" stroke-width=\"12\" fill=\"none\"/><path d=\"M-50 80 L450 60\" stroke=\"%23fff\" stroke-width=\"16\" fill=\"none\"/><path d=\"M-50 80 L450 60\" stroke=\"%23d5e2da\" stroke-width=\"12\" fill=\"none\"/></svg>'); position: relative;">
                <!-- Map Pin -->
                <div style="position: absolute; top: 45%; left: 50%; transform: translate(-50%, -100%);">
                  <div style="background: #1E8E7D; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                    <div style="width: 12px; height: 12px; background: #fff; border-radius: 50%; transform: rotate(45deg);"></div>
                  </div>
                </div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: 700; font-size: 0.85rem; color: #222; text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;">Manolya Cafe</div>
                <div style="position: absolute; bottom: 10px; left: 10px; display: flex; align-items: center; gap: 4px; font-weight: bold; font-size: 0.75rem; color: #555;"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg> Harita</div>
              </div>
              <button style="width: 100%; background: #f9f9f9; border: none; padding: 1rem; font-weight: 700; font-size: 1rem; color: #222; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-top: 1px solid #e0e0e0;">
                Yol Tarifi Al
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            
          </div>
          
        </div>

        <!-- Sticky Bottom Actions -->
        <div style="padding: 1rem 1.5rem 2rem; background: #fafafa; display: flex; gap: 1rem;">
          <button style="flex: 1; background: transparent; color: #1E8E7D; border: 2px solid #1E8E7D; padding: 1.1rem 0; border-radius: 999px; font-weight: 700; font-size: 1.05rem; cursor: pointer; white-space: nowrap;">
            Takvime Ekle
          </button>
          <button onclick="goTo(0)" style="flex: 1; background: #1E8E7D; color: #fff; border: 2px solid #1E8E7D; padding: 1.1rem 0; border-radius: 999px; font-weight: 700; font-size: 1.05rem; cursor: pointer; white-space: nowrap;">
            Ana Sayfaya Dön
          </button>
        </div>
      </section>"""

content = re.sub(screen5_search, screen5_old, content, flags=re.DOTALL)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
