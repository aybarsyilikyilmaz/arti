import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

screen5_search = r"""      <!-- ============ SCREEN 5 — Onay ============ -->
      <section class="screen" id="screen-5".*?</section>"""

screen5_premium = """      <!-- ============ SCREEN 5 — Onay ============ -->
      <section class="screen" id="screen-5" style="background: #f8f9fa; display: flex; flex-direction: column;">
        
        <div class="screen-body" style="padding: 4rem 1.5rem 10rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; align-items: center;">
          
          <!-- Premium Checkmark -->
          <div style="width: 80px; height: 80px; border-radius: 50%; background: #006256; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; box-shadow: 0 12px 30px rgba(0, 98, 86, 0.25); position: relative;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid rgba(0,98,86,0.2); transform: scale(1.3);"></div>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          
          <!-- Titles -->
          <h2 style="margin: 0 0 0.5rem; font-size: 1.8rem; font-weight: 800; color: #111; text-align: center; letter-spacing: -0.5px;">Siparişiniz Alındı!</h2>
          <p style="margin: 0 0 2.5rem; font-size: 1.05rem; font-weight: 500; color: #666; text-align: center; max-width: 280px; line-height: 1.4;">Bir sürpriz kutuyu kurtardığınız için teşekkürler!</p>

          <!-- Main Premium Card -->
          <div style="background: #fff; border-radius: 24px; padding: 2rem 1.5rem 0; width: 100%; box-shadow: 0 12px 40px rgba(0,0,0,0.04); display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden;">
            <h3 style="margin: 0 0 1.5rem; font-size: 1.15rem; font-weight: 800; color: #111; text-align: center; letter-spacing: -0.2px;">Teslim Alma Detayları</h3>
            
            <div style="background: #fff; border-radius: 20px; padding: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); border: 1px solid #f0f0f0; margin-bottom: 1.5rem;">
              <canvas id="qr-canvas" width="140" height="140" style="display: block; border-radius: 8px;"></canvas>
            </div>
            
            <div style="background: #e6f0ee; color: #006256; font-weight: 800; font-size: 0.85rem; padding: 0.6rem 1.2rem; border-radius: 999px; letter-spacing: 0.5px; margin-bottom: 2rem;">
              KOD: ARTI2024
            </div>
            
            <p style="margin: 0 0 0.4rem; font-size: 1.1rem; font-weight: 800; color: #111; text-align: center;">Manolya Cafe - Kadıköy, İstanbul</p>
            <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 2rem; color: #666; font-size: 0.95rem; font-weight: 500;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Bugün 18:00 - 18:30
            </div>
            
            <!-- Sleek Map box -->
            <div style="width: calc(100% + 3rem); margin-left: -1.5rem; margin-right: -1.5rem; background: #fafafa; border-top: 1px solid #f0f0f0; display: flex; flex-direction: column;">
              <div style="width: 100%; height: 100px; background-color: #e9ecef; background-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 400 120\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0 40 Q200 -20 400 60\" stroke=\"%23fff\" stroke-width=\"16\" fill=\"none\"/><path d=\"M100 120 L250 0\" stroke=\"%23fff\" stroke-width=\"16\" fill=\"none\"/><path d=\"M-50 80 L450 60\" stroke=\"%23ced4da\" stroke-width=\"12\" fill=\"none\"/></svg>'); position: relative;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%);">
                  <div style="background: #006256; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,98,86,0.3); border: 2px solid #fff;">
                    <div style="width: 10px; height: 10px; background: #fff; border-radius: 50%; transform: rotate(45deg);"></div>
                  </div>
                </div>
              </div>
              <button style="width: 100%; background: #fff; border: none; padding: 1.2rem 1.5rem; font-weight: 700; font-size: 1rem; color: #006256; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                Yol Tarifi Al
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            
          </div>
          
        </div>

        <!-- Sticky Bottom Actions -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 1.2rem 1.5rem 2rem; background: rgba(248,249,250,0.9); backdrop-filter: blur(12px); border-top: 1px solid rgba(0,0,0,0.04); display: flex; gap: 1rem; z-index: 10;">
          <button style="flex: 1; background: #fff; color: #111; border: 1px solid #e0e0e0; padding: 1.15rem 0; border-radius: 999px; font-weight: 700; font-size: 1.05rem; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.03); white-space: nowrap; transition: transform 0.1s;" onmousedown="this.style.transform='scale(0.97)';" onmouseup="this.style.transform='scale(1)';">
            Takvime Ekle
          </button>
          <button onclick="goTo(0)" style="flex: 1; background: #006256; color: #fff; border: none; padding: 1.15rem 0; border-radius: 999px; font-weight: 700; font-size: 1.05rem; cursor: pointer; box-shadow: 0 4px 16px rgba(0,98,86,0.25); white-space: nowrap; transition: transform 0.1s;" onmousedown="this.style.transform='scale(0.97)';" onmouseup="this.style.transform='scale(1)';">
            Ana Sayfaya Dön
          </button>
        </div>
      </section>"""

content = re.sub(screen5_search, screen5_premium, content, flags=re.DOTALL)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
