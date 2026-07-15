import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

screen5_search = r"""      <!-- ============ SCREEN 5 — Onay ============ -->
      <section class="screen" id="screen-5".*?</section>"""

screen5_premium = r"""      <!-- ============ SCREEN 5 — Onay ============ -->
      <section class="screen" id="screen-5" style="background: linear-gradient(180deg, #006256 0%, #004d43 40%, #003d36 100%); display: flex; flex-direction: column; position: relative;">
        
        <div class="screen-body" style="padding: 0; overflow-y: auto; flex: 1;">
          
          <!-- Top green area with check and title -->
          <div style="padding: 4.5rem 1.5rem 3rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
            
            <!-- Animated check circle -->
            <div style="width: 88px; height: 88px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; position: relative;">
              <div style="width: 68px; height: 68px; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center;">
                <div style="width: 52px; height: 52px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center;">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006256" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
            </div>
            
            <h2 style="margin: 0 0 0.5rem; font-size: 1.7rem; font-weight: 800; color: #fff; letter-spacing: -0.5px;">Siparişiniz Alındı!</h2>
            <p style="margin: 0; font-size: 1rem; font-weight: 400; color: rgba(255,255,255,0.7); max-width: 260px; line-height: 1.4;">Bir sürpriz kutuyu kurtardığınız için teşekkürler!</p>
          </div>
          
          <!-- White card area that overlaps -->
          <div style="background: #fff; border-radius: 28px 28px 0 0; padding: 2rem 1.5rem 9rem; min-height: 50vh;">
            
            <!-- Cafe info row -->
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f0f0f0;">
              <div style="width: 56px; height: 56px; border-radius: 14px; background-image: url('manolya.jpg'); background-size: cover; background-position: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></div>
              <div style="flex: 1;">
                <h4 style="margin: 0 0 0.3rem; font-size: 1.1rem; font-weight: 700; color: #111;">Manolya Cafe</h4>
                <p style="margin: 0; font-size: 0.9rem; color: #666;">Vejetaryen sürpriz kutu</p>
              </div>
              <div style="background: #e8f5e9; color: #2e7d32; font-size: 0.8rem; font-weight: 700; padding: 0.4rem 0.8rem; border-radius: 999px;">250 ₺</div>
            </div>
            
            <!-- QR Code -->
            <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 2rem;">
              <div style="background: #fafafa; border-radius: 20px; padding: 1.2rem; box-shadow: 0 2px 12px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;">
                <canvas id="qr-canvas" width="160" height="160" style="display: block; border-radius: 12px;"></canvas>
              </div>
              <div style="margin-top: 1rem; background: #006256; color: #fff; font-weight: 800; font-size: 0.9rem; padding: 0.6rem 1.6rem; border-radius: 999px; letter-spacing: 1px;">
                ARTI2024
              </div>
            </div>
            
            <!-- Pickup time -->
            <div style="background: #fafafa; border-radius: 16px; padding: 1.2rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: #e8f5e9; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div>
                <p style="margin: 0 0 0.2rem; font-size: 0.8rem; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Teslim alma zamanı</p>
                <p style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #111;">Bugün 18:00 – 18:30</p>
              </div>
            </div>
            
            <!-- Location -->
            <div style="background: #fafafa; border-radius: 16px; padding: 1.2rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
              <div style="width: 44px; height: 44px; border-radius: 12px; background: #e3f2fd; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div style="flex: 1;">
                <p style="margin: 0 0 0.2rem; font-size: 0.8rem; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Konum</p>
                <p style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #111;">Bahariye Cd. No:12, Kadıköy</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </div>
            
            <!-- CO2 impact -->
            <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 16px; padding: 1.2rem; display: flex; align-items: center; gap: 1rem;">
              <span style="font-size: 2rem;">🌍</span>
              <div>
                <p style="margin: 0 0 0.2rem; font-size: 1rem; font-weight: 700; color: #2e7d32;">1.2 kg CO₂ tasarrufu!</p>
                <p style="margin: 0; font-size: 0.85rem; color: #558b2f; line-height: 1.3;">Bu yemeği kurtararak gezegenimize katkıda bulundunuz.</p>
              </div>
            </div>
            
          </div>
          
        </div>

        <!-- Sticky Bottom Actions -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 1rem 1.5rem 2rem; background: rgba(255,255,255,0.95); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-top: 1px solid rgba(0,0,0,0.05); display: flex; gap: 0.8rem; z-index: 10;">
          <button style="flex: 1; background: #fff; color: #111; border: 1.5px solid #e0e0e0; padding: 1.1rem 0; border-radius: 14px; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: transform 0.1s;" onmousedown="this.style.transform='scale(0.97)';" onmouseup="this.style.transform='scale(1)';">
            Takvime Ekle
          </button>
          <button onclick="goTo(0)" style="flex: 1; background: #006256; color: #fff; border: none; padding: 1.1rem 0; border-radius: 14px; font-weight: 700; font-size: 0.95rem; cursor: pointer; box-shadow: 0 6px 20px rgba(0,98,86,0.3); transition: transform 0.1s;" onmousedown="this.style.transform='scale(0.97)';" onmouseup="this.style.transform='scale(1)';">
            Ana Sayfaya Dön
          </button>
        </div>
      </section>"""

content = re.sub(screen5_search, screen5_premium, content, flags=re.DOTALL)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
