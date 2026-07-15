import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

screen3_search = r"""      <!-- ============ SCREEN 3 — Mağaza detayı ============ -->
      <section class="screen" id="screen-3">.*?      <!-- ============ SCREEN 4 — Rezervasyon ve ödeme ============ -->"""

screen3_premium = """      <!-- ============ SCREEN 3 — Mağaza detayı (Premium) ============ -->
      <section class="screen" id="screen-3" style="background: #fdfdfd;">
        <!-- Full edge-to-edge Hero Image -->
        <div class="premium-hero" style="position: absolute; top: 0; left: 0; right: 0; height: 22rem; background-image: url('manolya.jpg'); background-size: cover; background-position: center;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 6rem; background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);"></div>
        </div>
        
        <!-- Floating Header Actions -->
        <div style="position: absolute; top: 3.5rem; left: 1.2rem; right: 1.2rem; display: flex; justify-content: space-between; z-index: 10;">
          <button onclick="goTo(2)" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.9); border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer; backdrop-filter: blur(4px);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <button style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.9); border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer; backdrop-filter: blur(4px);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
          </button>
        </div>

        <div class="screen-body" style="padding: 0; margin-top: 18rem; position: relative; z-index: 5; background: transparent; overflow-y: auto;">
          <!-- Content Sheet -->
          <div style="background: #fff; border-radius: 28px 28px 0 0; padding: 2.5rem 1.5rem 8rem; min-height: 60vh; box-shadow: 0 -8px 20px rgba(0,0,0,0.06);">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <h2 style="margin: 0; font-size: 1.8rem; font-weight: 800; color: #111; letter-spacing: -0.5px; line-height: 1.2;">Manolya Cafe</h2>
              <div style="background: #FFF1F1; color: #E84545; font-size: 0.75rem; font-weight: 700; padding: 0.4rem 0.8rem; border-radius: 999px; white-space: nowrap; letter-spacing: -0.2px;">Hızla tükeniyor</div>
            </div>
            
            <p style="margin: 0 0 1rem; font-size: 1rem; color: #666; font-weight: 500;">Vejetaryen sürpriz kutu</p>
            
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem;">
              <div style="display: flex; align-items: center; gap: 0.2rem; color: #F2C94C;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span style="font-weight: 800; color: #111; font-size: 0.95rem; margin-left: 0.2rem;">4.4</span>
              </div>
              <span style="color: #999; font-size: 0.9rem;">(120+ değerlendirme)</span>
            </div>
            
            <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 0 0 2rem;"/>

            <div style="margin-bottom: 2rem;">
              <h4 style="font-size: 1.15rem; font-weight: 700; color: #111; margin: 0 0 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.4rem;">🎒</span> Kutuda ne olabilir?
              </h4>
              <p style="font-size: 0.95rem; color: #555; line-height: 1.6; margin-bottom: 1rem;">Taze, yüksek kaliteli vejetaryen ürünlerin bir karışımı: sandviçler, dürümler, hamur işleri ve mevsimlik ürünler. İçerik günlük olarak değişir!</p>
              <ul style="padding-left: 1.2rem; margin: 0; color: #555; font-size: 0.95rem; line-height: 1.8;">
                <li>Vejetaryen seçenekler</li>
                <li>Hamur işleri ve ekmek</li>
                <li>Mevsim taze ürünler</li>
              </ul>
            </div>

            <div style="margin-bottom: 2.5rem; background: #f8f9fa; padding: 1.2rem; border-radius: 16px;">
              <h4 style="font-size: 1.05rem; font-weight: 700; color: #111; margin: 0 0 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006256" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                Teslim alma
              </h4>
              <p style="margin: 0; font-size: 0.95rem; color: #666; padding-left: 1.8rem; line-height: 1.5;">Bugün 18:00 – 18:30 <br/><span style="color: #999; font-size: 0.85rem;">Kendi çantanı getirmeyi unutma!</span></p>
            </div>

            <div style="margin-bottom: 1rem;">
              <h4 style="font-size: 1.05rem; font-weight: 700; color: #111; margin: 0 0 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006256" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Konum
              </h4>
              <p style="margin: 0 0 1rem; font-size: 0.95rem; color: #666; padding-left: 1.8rem; line-height: 1.5;">
                <strong style="color: #111;">Manolya Cafe</strong><br/>
                Bahariye Cd. No:12, Kadıköy, İstanbul
              </p>
              <div style="width: 100%; height: 130px; border-radius: 16px; background-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 400 120\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"400\" height=\"120\" fill=\"%23e9ecef\"/><path d=\"M0 40 Q200 -20 400 60\" stroke=\"%23fff\" stroke-width=\"12\" fill=\"none\"/><path d=\"M100 120 L250 0\" stroke=\"%23fff\" stroke-width=\"12\" fill=\"none\"/><path d=\"M0 40 Q200 -20 400 60\" stroke=\"%23ced4da\" stroke-width=\"8\" fill=\"none\"/><path d=\"M100 120 L250 0\" stroke=\"%23ced4da\" stroke-width=\"8\" fill=\"none\"/></svg>'); position: relative; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #006256; width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="#006256"/></svg></div>
              </div>
            </div>

          </div>
        </div>

        <!-- Sticky Bottom CTA -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(255,255,255,1) 80%, rgba(255,255,255,0)); padding: 3rem 1.5rem 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; z-index: 10;">
          <div style="display: flex; flex-direction: column;">
            <span style="text-decoration: line-through; color: #999; font-size: 0.9rem; font-weight: 500;">500 ₺</span>
            <span style="color: #006256; font-weight: 800; font-size: 1.7rem; letter-spacing: -0.5px; line-height: 1;">250 ₺</span>
          </div>
          <button style="flex: 1; background: #006256; color: #fff; border: none; padding: 1.15rem; border-radius: 999px; font-weight: 700; font-size: 1.1rem; letter-spacing: -0.2px; cursor: pointer; transition: transform 0.15s, opacity 0.15s;" onmousedown="this.style.transform='scale(0.96)';this.style.opacity='0.9'" onmouseup="this.style.transform='scale(1)';this.style.opacity='1'" onclick="goTo(4)">
            Rezerve et
          </button>
        </div>
      </section>
      <!-- ============ SCREEN 4 — Rezervasyon ve ödeme ============ -->"""

content = re.sub(screen3_search, screen3_premium, content, flags=re.DOTALL)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
