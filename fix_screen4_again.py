import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

screen4_search = r"""      <!-- ============ SCREEN 4 — Rezervasyon ve ödeme \(Premium\) ============ -->
      <section class="screen" id="screen-4" style="background: #fdfdfd;">.*?</section>"""

screen4_new = """      <!-- ============ SCREEN 4 — Rezervasyon ve ödeme ============ -->
      <section class="screen" id="screen-4" style="background: #fff; display: flex; flex-direction: column;">
        
        <!-- Header -->
        <div style="padding: 3.5rem 1.2rem 1rem; display: flex; align-items: center; border-bottom: 1px solid #f0f0f0;">
          <button class="icon-btn" onclick="goTo(3)" style="width: 32px; height: 32px; background: none; border: none; display: flex; align-items: center; justify-content: flex-start; cursor: pointer; padding: 0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <h2 style="flex: 1; text-align: center; margin: 0; font-size: 1.1rem; font-weight: 700; color: #111; margin-right: 32px;">Rezervasyon ve Ödeme</h2>
        </div>

        <div class="screen-body" style="padding: 1.5rem; overflow-y: auto; flex: 1;">
          
          <!-- Sipariş Özeti -->
          <h3 style="margin: 0 0 1rem; font-size: 1.2rem; font-weight: 800; color: #111;">Sipariş Özeti</h3>
          <div style="background: #fff; border-radius: 12px; padding: 1rem; display: flex; gap: 1rem; margin-bottom: 2rem; box-shadow: 0 2px 15px rgba(0,0,0,0.08); border: 1px solid #f9f9f9;">
            <div style="width: 70px; height: 70px; border-radius: 8px; background-image: url('manolya.jpg'); background-size: cover; background-position: center; flex-shrink: 0;"></div>
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <h4 style="margin: 0 0 0.2rem; font-size: 1rem; font-weight: 700; color: #111;">Manolya Cafe</h4>
              <p style="margin: 0 0 0.1rem; font-size: 0.85rem; color: #666;">Vejetaryen sürpriz kutu</p>
              <p style="margin: 0; font-size: 0.85rem; color: #666;">Bugün alın 18:00 - 18:30</p>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
              <span style="text-decoration: line-through; color: #999; font-size: 0.8rem; margin-bottom: 0.2rem;">500 ₺</span>
              <span style="color: #388E3C; font-weight: 800; font-size: 1.1rem;">250 ₺</span>
            </div>
          </div>

          <!-- Ödeme Yöntemi -->
          <h3 style="margin: 0 0 1rem; font-size: 1.2rem; font-weight: 800; color: #111;">Ödeme Yöntemi</h3>
          <div style="display: flex; flex-direction: column; gap: 1.2rem; margin-bottom: 0.5rem;">
            
            <div style="display: flex; align-items: center; gap: 1rem; cursor: pointer;">
              <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ccc;"></div>
              <div style="background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid #ddd; display: flex; align-items: center;"><svg width="24" height="16" viewBox="0 0 24 16" fill="#111"><text x="2" y="12" font-family="sans-serif" font-weight="bold" font-size="10">VISA</text></svg></div>
              <span style="font-size: 0.95rem; color: #333;">Kredi Kartı (sonu 1234)</span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 1rem; cursor: pointer;">
              <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #388E3C; background: #388E3C; display: flex; align-items: center; justify-content: center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div style="background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 4px; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center;"><svg width="24" height="16" viewBox="0 0 40 16" fill="#111"><path d="M16.9 14.8c-2.3 0-4-1.6-4-4s1.7-4 4-4 4 1.6 4 4-1.8 4-4 4zm0-6.7c-1.5 0-2.5 1.1-2.5 2.7s1 2.7 2.5 2.7 2.5-1.1 2.5-2.7-1-2.7-2.5-2.7zM26.2 14.8c-2.1 0-3.6-1.4-3.6-3.7 0-2.4 1.6-3.7 3.5-3.7 1.1 0 1.9.4 2.5 1.1l-.8.9c-.4-.4-.9-.7-1.6-.7-1.3 0-2.2 1-2.2 2.4s.9 2.4 2.2 2.4c.8 0 1.4-.4 1.7-.8l1 .8c-.6.9-1.6 1.3-2.7 1.3zM32.6 14.8c-2.3 0-4-1.6-4-4s1.7-4 4-4 4 1.6 4 4-1.8 4-4 4zm0-6.7c-1.5 0-2.5 1.1-2.5 2.7s1 2.7 2.5 2.7 2.5-1.1 2.5-2.7-1-2.7-2.5-2.7zM8.2 14.6H6.6V7.3h1.6v7.3zm-.8-8.5c-.6 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zM2.8 14.6H1.2V3h1.6v11.6z"/><path d="M10.7 4.1c.4-.5.7-1.2.6-1.8-.5 0-1.2.3-1.6.8-.4.4-.7 1.1-.6 1.8.6 0 1.2-.3 1.6-.8zm.8 4.2c0-1.5.8-2.4 2-2.9-1-1-2.6-1.1-3.3-1.1-1.3 0-2.5.8-3.2.8-.7 0-1.8-.7-3-.7-1.5 0-3 1-3.8 2.4-1.5 2.6-.4 6.5 1.1 8.7.7 1 1.6 2.2 2.7 2.2 1 0 1.5-.7 2.8-.7s1.8.7 2.9.7c1.1 0 1.9-1.1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.5 0-.1-2.3-.9-2.3-3.6z"/></svg></div>
              <span style="font-size: 0.95rem; color: #333;">Apple Pay</span>
            </div>
            
          </div>
          <a href="#" style="font-size: 0.85rem; color: #888; text-decoration: underline; margin-bottom: 2.5rem; display: block;">Ödeme yöntemini değiştir</a>

          <!-- Doğaya Katkın -->
          <h3 style="margin: 0 0 1rem; font-size: 1.2rem; font-weight: 800; color: #111;">Doğaya Katkın</h3>
          <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 2rem;">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="#388E3C" style="margin-bottom: 1rem;"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><path d="M12 22v-9" stroke="#fff" stroke-width="2"/></svg>
            <p style="margin: 0 0 0.5rem; font-size: 1.1rem; font-weight: 700; color: #111;">1,2 kg CO₂ tasarrufu yaptınız!</p>
            <p style="margin: 0; font-size: 0.9rem; color: #666; max-width: 280px; line-height: 1.4;">Bu yemeği kurtararak gezegenimize yardım ediyorsunuz.</p>
          </div>

        </div>

        <!-- Sticky Bottom CTA -->
        <div style="padding: 1rem 1.5rem 2rem; background: #fff; border-top: 1px solid #f0f0f0;">
          <button style="width: 100%; background: #388E3C; color: #fff; border: none; padding: 1.2rem; border-radius: 999px; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: transform 0.1s;" onmousedown="this.style.transform='scale(0.97)';" onmouseup="this.style.transform='scale(1)';">
            Ödemeyi Onayla 250 ₺
          </button>
        </div>
      </section>"""

content = re.sub(screen4_search, screen4_new, content, flags=re.DOTALL)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
