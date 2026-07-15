import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

screen4_search = r"""      <!-- ============ SCREEN 4 — Rezervasyon ve ödeme ============ -->
      <section class="screen" id="screen-4">.*?</section>"""

screen4_premium = """      <!-- ============ SCREEN 4 — Rezervasyon ve ödeme (Premium) ============ -->
      <section class="screen" id="screen-4" style="background: #fdfdfd;">
        
        <!-- Header (Notch Safe) -->
        <div style="padding: 3.5rem 1.2rem 1rem; display: flex; align-items: center; justify-content: space-between;">
          <button class="icon-btn" onclick="goTo(3)" style="width: 40px; height: 40px; border-radius: 50%; background: #fff; border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div style="width: 40px;"></div>
        </div>

        <div class="screen-body" style="padding: 0 1.5rem 8rem; overflow-y: auto;">
          
          <!-- Logo & Title -->
          <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 2rem;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background-image: url('manolya.jpg'); background-size: cover; background-position: center; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 2px solid #fff;"></div>
            <h2 style="margin: 0; font-size: 1.3rem; font-weight: 800; color: #111; text-align: center; letter-spacing: -0.3px;">Manolya Cafe (Vejetaryen Kutu)</h2>
          </div>
          
          <!-- Time Card -->
          <div style="background: #fff; border-radius: 16px; padding: 1.2rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; box-shadow: 0 2px 12px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;">
            <span style="font-size: 1.1rem; font-weight: 800; color: #111;">Bugün</span>
            <div style="background: #A0E8AF; color: #000; padding: 0.5rem 1rem; border-radius: 999px; font-weight: 800; font-size: 1rem; letter-spacing: -0.2px;">
              18:00 - 18:30
            </div>
          </div>

          <!-- Payment Method Card -->
          <div style="background: #fff; border-radius: 16px; padding: 1.2rem; margin-bottom: 1rem; box-shadow: 0 2px 12px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;">
            <p style="margin: 0 0 0.8rem; font-size: 0.75rem; font-weight: 700; color: #555; letter-spacing: 0.5px;">ÖDEME YÖNTEMİ</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 0.8rem;">
                <div style="background: #f4f4f4; padding: 0.4rem 0.6rem; border-radius: 6px; font-weight: 800; font-size: 0.8rem; color: #333; border: 1px solid #e0e0e0;">VISA</div>
                <span style="font-size: 1rem; color: #222; font-weight: 500;">Apple Pay</span>
              </div>
              <button style="background: none; border: none; color: #006256; font-weight: 700; font-size: 0.95rem; cursor: pointer; padding: 0;">Değiştir</button>
            </div>
          </div>

          <!-- Total Card -->
          <div style="background: #fff; border-radius: 16px; padding: 1.2rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; box-shadow: 0 2px 12px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;">
            <span style="font-size: 1.1rem; font-weight: 800; color: #111;">Toplam</span>
            <span style="font-size: 1.2rem; font-weight: 800; color: #111;">250 ₺</span>
          </div>

          <!-- CO2 Saving Banner -->
          <div style="background: #E8F5E9; border-radius: 16px; padding: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1.5rem; border: 1px dashed #A5D6A7;">
            <span style="font-size: 1.3rem;">🌱</span>
            <span style="color: #2E7D32; font-weight: 700; font-size: 0.95rem; letter-spacing: -0.2px;">Bu siparişle 1,2 kg CO₂ tasarrufu yapacaksınız</span>
          </div>

          <!-- Terms -->
          <p style="text-align: center; font-size: 0.8rem; color: #888; line-height: 1.5; margin: 0 1rem;">
            Bu yemeği rezerve ederek Artı'nın <a href="#" style="color: #006256; text-decoration: underline;">Şartlar ve Koşullar</a>'ını kabul etmiş olursunuz.
          </p>

        </div>

        <!-- Sticky Bottom CTA (Counter + Pay Button) -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: #fff; padding: 1rem 1.5rem 2rem; display: flex; align-items: center; gap: 1rem; z-index: 10; box-shadow: 0 -4px 20px rgba(0,0,0,0.06);">
          
          <!-- Counter -->
          <div style="background: #f4f4f4; border-radius: 999px; display: flex; align-items: center; justify-content: space-between; width: 110px; padding: 0.6rem 0.4rem;">
            <button style="background: none; border: none; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #888;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>
            </button>
            <span style="font-weight: 700; font-size: 1.1rem; color: #111;">1</span>
            <button style="background: none; border: none; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #111;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>

          <!-- Pay Button -->
          <button style="flex: 1; background: #111; color: #fff; border: none; padding: 1.1rem; border-radius: 999px; font-weight: 700; font-size: 1.1rem; letter-spacing: -0.2px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: transform 0.15s;" onmousedown="this.style.transform='scale(0.96)';" onmouseup="this.style.transform='scale(1)';">
            <svg width="40" height="16" viewBox="0 0 40 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.9 14.8c-2.3 0-4-1.6-4-4s1.7-4 4-4 4 1.6 4 4-1.8 4-4 4zm0-6.7c-1.5 0-2.5 1.1-2.5 2.7s1 2.7 2.5 2.7 2.5-1.1 2.5-2.7-1-2.7-2.5-2.7zM26.2 14.8c-2.1 0-3.6-1.4-3.6-3.7 0-2.4 1.6-3.7 3.5-3.7 1.1 0 1.9.4 2.5 1.1l-.8.9c-.4-.4-.9-.7-1.6-.7-1.3 0-2.2 1-2.2 2.4s.9 2.4 2.2 2.4c.8 0 1.4-.4 1.7-.8l1 .8c-.6.9-1.6 1.3-2.7 1.3zM32.6 14.8c-2.3 0-4-1.6-4-4s1.7-4 4-4 4 1.6 4 4-1.8 4-4 4zm0-6.7c-1.5 0-2.5 1.1-2.5 2.7s1 2.7 2.5 2.7 2.5-1.1 2.5-2.7-1-2.7-2.5-2.7zM8.2 14.6H6.6V7.3h1.6v7.3zm-.8-8.5c-.6 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zM2.8 14.6H1.2V3h1.6v11.6z"/>
              <!-- Apple logo approximation -->
              <path d="M10.7 4.1c.4-.5.7-1.2.6-1.8-.5 0-1.2.3-1.6.8-.4.4-.7 1.1-.6 1.8.6 0 1.2-.3 1.6-.8zm.8 4.2c0-1.5.8-2.4 2-2.9-1-1-2.6-1.1-3.3-1.1-1.3 0-2.5.8-3.2.8-.7 0-1.8-.7-3-.7-1.5 0-3 1-3.8 2.4-1.5 2.6-.4 6.5 1.1 8.7.7 1 1.6 2.2 2.7 2.2 1 0 1.5-.7 2.8-.7s1.8.7 2.9.7c1.1 0 1.9-1.1 2.6-2.1.8-1.2 1.2-2.4 1.2-2.5 0-.1-2.3-.9-2.3-3.6z"/>
            </svg>
          </button>
        </div>
      </section>"""

content = re.sub(screen4_search, screen4_premium, content, flags=re.DOTALL)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
