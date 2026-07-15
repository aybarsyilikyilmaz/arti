import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add .no-scrollbar styling to <style> block
style_end = "</style>"
style_addition = """  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>"""
content = content.replace(style_end, style_addition)

# 2. Define the new screen HTML block for Screen 1 (Keşfet)
discover_screen_html = """      <!-- ============ SCREEN 1 — Keşfet (TGTG Discover style) ============ -->
      <section class="screen" id="screen-keşfet" style="background: #fafafa; display: flex; flex-direction: column;">
        <div class="status-bar" style="background: #fff; flex-shrink: 0; z-index: 10;">
          <span>9:08</span>
          <span class="status-icons">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><rect x="0" y="7" width="2.5" height="4" rx="0.5" fill="currentColor"/><rect x="4.5" y="5" width="2.5" height="6" rx="0.5" fill="currentColor"/><rect x="9" y="3" width="2.5" height="8" rx="0.5" fill="currentColor"/><rect x="13.5" y="0" width="2.5" height="11" rx="0.5" fill="currentColor"/></svg>
            <span style="font-size: 0.75rem; font-weight: bold; margin-left: 2px;">5G</span>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" style="margin-left: 4px;"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="15" height="8" rx="1.2" fill="currentColor"/><rect x="21.5" y="3.5" width="1.6" height="5" rx="0.8" fill="currentColor"/></svg>
          </span>
        </div>

        <!-- Top Location Row -->
        <div style="background: #fff; padding: 0.6rem 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; cursor: pointer; z-index: 10;" onclick="goTo(0)">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #eef7f4; display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006256" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.75rem; color: #888; font-weight: 500;">Seçilen Konum</span>
            <span style="font-size: 0.9rem; color: #111; font-weight: 800; display: flex; align-items: center; gap: 2px;">
              Kadıköy, İstanbul 
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#006256" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </span>
          </div>
        </div>

        <!-- Scrollable content -->
        <div class="screen-body no-scrollbar" style="overflow-y: auto; flex: 1; padding: 1rem 0; display: flex; flex-direction: column; gap: 1.8rem;">
          
          <!-- Horizontal Chips scroll -->
          <div class="no-scrollbar" style="display: flex; gap: 0.6rem; overflow-x: auto; padding: 0 1rem; flex-shrink: 0;">
            <div style="background: #006256; color: #fff; padding: 0.5rem 1rem; border-radius: 999px; font-weight: 700; font-size: 0.85rem; white-space: nowrap;">Tümü</div>
            <div style="background: #f4f4f4; color: #555; padding: 0.5rem 1rem; border-radius: 999px; font-weight: 700; font-size: 0.85rem; white-space: nowrap;">Yemekler</div>
            <div style="background: #f4f4f4; color: #555; padding: 0.5rem 1rem; border-radius: 999px; font-weight: 700; font-size: 0.85rem; white-space: nowrap;">Unlu Mamüller</div>
            <div style="background: #f4f4f4; color: #555; padding: 0.5rem 1rem; border-radius: 999px; font-weight: 700; font-size: 0.85rem; white-space: nowrap;">Market</div>
            <div style="background: #f4f4f4; color: #555; padding: 0.5rem 1rem; border-radius: 999px; font-weight: 700; font-size: 0.85rem; white-space: nowrap;">Çiçek</div>
          </div>

          <!-- Section 1: Top Picks Near You -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 1rem; margin-bottom: 0.8rem;">
              <h3 style="margin: 0; font-size: 1.15rem; font-weight: 850; color: #111;">Sizin için seçilenler</h3>
              <a href="#" onclick="goTo(3); return false;" style="font-size: 0.85rem; font-weight: 700; color: #006256; text-decoration: none;">Tümünü gör</a>
            </div>
            
            <div class="no-scrollbar" style="display: flex; gap: 1rem; overflow-x: auto; padding: 0 1rem;">
              
              <!-- Card 1: Boojum -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('boojum_burrito.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Hızla tükeniyor</div>
                  <div style="position: absolute; top: 8px; right: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; display: flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">★ 4.4</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #006256; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">B</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Boojum - Kadıköy</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Sürpriz Kutu</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Bugün 23:45 - 00:00</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>2.8 km</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">500 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">250 ₺</span>
                  </div>
                </div>
              </div>
              
              <!-- Card 2: Manolya Cafe -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('manolya_cafe_1784057486309.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">2 adet kaldı</div>
                  <div style="position: absolute; top: 8px; right: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; display: flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">★ 4.8</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #d32f2f; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">M</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Manolya Cafe</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Sürpriz Kutu (Vejetaryen)</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Bugün 18:00 - 18:30</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>450 m</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">500 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">250 ₺</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Section 2: Local Heroes -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 1rem; margin-bottom: 0.8rem;">
              <h3 style="margin: 0; font-size: 1.15rem; font-weight: 850; color: #111;">Yerel Kahramanlar</h3>
              <a href="#" onclick="goTo(3); return false;" style="font-size: 0.85rem; font-weight: 700; color: #006256; text-decoration: none;">Tümünü gör</a>
            </div>
            
            <div class="no-scrollbar" style="display: flex; gap: 1rem; overflow-x: auto; padding: 0 1rem;">
              
              <!-- Card 1: Meet our Local Heroes banner -->
              <div style="flex: 0 0 250px; background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%); border-radius: 16px; padding: 1.2rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #c2e8e4; height: 210px; box-sizing: border-box;">
                <span style="background: #006256; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 0.65rem; width: fit-content; text-transform: uppercase;">Yeni</span>
                <div>
                  <h4 style="margin: 0 0 0.4rem; font-size: 0.95rem; font-weight: 900; color: #004d40; line-height: 1.3;">YEREL KAHRAMANLARIMIZ</h4>
                  <p style="margin: 0; font-size: 0.75rem; color: #004d40; line-height: 1.4; opacity: 0.9;">Sürekli yüksek puanlı kutular sunan ve israfla mücadele eden işletmeler.</p>
                </div>
              </div>
              
              <!-- Card 2: Papatya Fırın -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column; height: 210px;" onclick="goTo(4)">
                <div style="position: relative; height: 110px; background-image: url('papatya_cafe_1784057494287.jpg'); background-size: cover; background-position: center;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Çok beğenilen</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #ffb300; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">P</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.1rem; flex: 1; justify-content: space-between;">
                  <div>
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111;">Papatya Fırın</h4>
                    <span style="font-size: 0.75rem; color: #666;">Fırın Sürpriz Kutusu</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.1rem;">
                    <span style="font-size: 0.75rem; color: #777;">700m &bull; Bugün 17:00</span>
                    <div style="display: flex; gap: 0.3rem; align-items: center;">
                      <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">400 ₺</span>
                      <span style="font-size: 0.9rem; font-weight: 800; color: #006256;">200 ₺</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Section 3: Save before it's too late -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 1rem; margin-bottom: 0.8rem;">
              <h3 style="margin: 0; font-size: 1.15rem; font-weight: 850; color: #111;">Çok geç olmadan kurtar</h3>
              <a href="#" onclick="goTo(3); return false;" style="font-size: 0.85rem; font-weight: 700; color: #006256; text-decoration: none;">Tümünü gör</a>
            </div>
            
            <div class="no-scrollbar" style="display: flex; gap: 1rem; overflow-x: auto; padding: 0 1rem;">
              
              <!-- Card 1: Circle K -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('pastries_sandwiches.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #d32f2f; color: #fff; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">2 adet kaldı</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #e65100; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">C</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Circle K - Bahariye</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Tatlı & Tuzlu Sürpriz Kutu</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Bugün 20:00 - 22:00</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>788 m</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">450 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">200 ₺</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Section 4: New Surprise Bags -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 1rem; margin-bottom: 0.8rem;">
              <h3 style="margin: 0; font-size: 1.15rem; font-weight: 850; color: #111;">Yeni Sürpriz Kutular</h3>
              <a href="#" onclick="goTo(3); return false;" style="font-size: 0.85rem; font-weight: 700; color: #006256; text-decoration: none;">Tümünü gör</a>
            </div>
            
            <div class="no-scrollbar" style="display: flex; gap: 1rem; overflow-x: auto; padding: 0 1rem;">
              
              <!-- Card 1: Organik Manav -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('fresh_groceries.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #006256; color: #fff; font-weight: 800; font-size: 0.75rem; padding: 4px 10px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Yeni</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #2e7d32; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">O</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Organik Manav - Moda</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Sebze & Meyve Kutusu</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Yarın 10:00 - 12:00</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>1.2 km</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">300 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">150 ₺</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- Tab Bar -->
        <div class="tab-bar" style="flex-shrink: 0; z-index: 10;">
          <button class="tab-active" onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button onclick="goTo(2)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>
      </section>"""

content = content.replace("      <!-- ============ SCREEN 1 — Harita + yakında (TGTG Style) ============ -->", discover_screen_html + "\n\n      <!-- ============ SCREEN 2 — Harita + yakında (TGTG Style) ============ -->")

# 3. Update the old Screen 1 HTML tag to make it section-2
content = content.replace("<section class=\"screen\" id='screen-1'>", "<section class=\"screen\" id='screen-1'>") # Keep id but index shifts

# 4. Modify Tab Bar inside Screen 2 (formerly Screen 1, Map style)
old_tab_bar_s2 = """        <div class="tab-bar">
          <button>🧭<span>Keşfet</span></button>
          <button class="tab-active">🗺️<span>Göz At</span></button>
          <button>♡<span>Favoriler</span></button>
          <button>👤<span>Profil</span></button>
        </div>"""

new_tab_bar_s2 = """        <div class="tab-bar">
          <button onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button class="tab-active" onclick="goTo(2)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>"""
content = content.replace(old_tab_bar_s2, new_tab_bar_s2)

# 5. Modify Tab Bar inside Screen 3 (formerly Screen 2, List style)
old_tab_bar_s3 = """        <div class="tab-bar">
          <button>🧭<span>Keşfet</span></button>
          <button class="tab-active">🗺️<span>Göz At</span></button>
          <button>♡<span>Favoriler</span></button>
          <button>👤<span>Profil</span></button>
        </div>"""

new_tab_bar_s3 = """        <div class="tab-bar">
          <button onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button class="tab-active" onclick="goTo(3)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>"""
content = content.replace(old_tab_bar_s3, new_tab_bar_s3)

# 6. Add list toggle button inside Screen 2 (formerly Screen 1, Map style)
# Replace the second tgtg-icon-btn (filter lines) with a list button
old_map_header_buttons = """            <button class="tgtg-icon-btn" style="background: #fff; border: none; border-radius: 8px; width: 2.8rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill='none' stroke="#000" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
            </button>"""

new_map_header_buttons = """            <button onclick="goTo(3)" class="tgtg-icon-btn" style="background: #fff; border: none; border-radius: 8px; width: 2.8rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" title="Liste Görünümü">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>"""
content = content.replace(old_map_header_buttons, new_map_header_buttons)

# 7. Add map toggle button inside Screen 3 (formerly Screen 2, List style) header
# We will put it in the top right of the header row
old_list_header = """        <div class="header-row" style="padding: 0.8rem 1.4rem 0.4rem; justify-content: center; position: relative;">
          <div style="text-align:center;">
            <p style="font-size:0.75rem; color: var(--app-muted); font-weight:700; margin:0; text-transform:uppercase; letter-spacing:0.05em;">Teslimat Adresi</p>
            <p style="font-size:0.95rem; font-weight:800; margin:0;">Kadıköy, İstanbul ▾</p>
          </div>
        </div>"""

new_list_header = """        <div class="header-row" style="padding: 0.8rem 1.4rem 0.4rem; display: flex; justify-content: space-between; align-items: center; position: relative;">
          <div style="width: 2.8rem;"></div> <!-- Spacing spacer -->
          <div style="text-align:center; flex: 1;">
            <p style="font-size:0.75rem; color: var(--app-muted); font-weight:700; margin:0; text-transform:uppercase; letter-spacing:0.05em;">Teslimat Adresi</p>
            <p style="font-size:0.95rem; font-weight:800; margin:0;">Kadıköy, İstanbul ▾</p>
          </div>
          <button onclick="goTo(2)" style="background: none; border: none; cursor: pointer; width: 2.8rem; height: 2.8rem; display: flex; align-items: center; justify-content: center;" title="Harita Görünümü">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>
          </button>
        </div>"""
content = content.replace(old_list_header, new_list_header)

# 8. Adjust all goTo indices in HTML elements for index shift
content = content.replace('onclick="goTo(3)"', 'onclick="goTo(4)"') # Any goTo(3) (detail) goes to goTo(4)
content = content.replace('onclick="goTo(2)"', 'onclick="goTo(3)"') # Any goTo(2) (list) goes to goTo(3) (except the ones we just added)
content = content.replace('onclick="goTo(4)"', 'onclick="goTo(5)"') # Any goTo(4) (checkout) goes to goTo(5)

# Wait! Let's correct the detail back button which was goTo(2) -> now goTo(3) (Göz At list)
# And let's make sure the logo button on confirmation screen goes to goTo(1) (Keşfet)
content = content.replace('onclick="goTo(0)"', 'onclick="goTo(1)"')

# 9. Update the confirmPayment JS code loading screen indices:
# goTo(5) -> goTo(6)
# goTo(6) -> goTo(7)
old_payment_confirm_indices = """    // Reset state inline immediately
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
        
        // Generate real 6-digit random pickup code (e.g. 749204)
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        document.getElementById('pickup-code-display').textContent = randomCode;
        
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
    }, 200);"""

new_payment_confirm_indices = """    // Reset state inline immediately
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
        
        // Generate real 6-digit random pickup code (e.g. 749204)
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        document.getElementById('pickup-code-display').textContent = randomCode;
        
        // Generate REAL QR Code using QRious library on the canvas
        new QRious({
          element: document.getElementById('qr-canvas'),
          value: 'https://artiapp.com/order/' + randomCode,
          size: 160,
          background: '#ffffff',
          foreground: '#21261f',
          level: 'H'
        });
        
        // Go to screen 7 after checkmark shows (1.2s)
        setTimeout(() => {
          goTo(7);
        }, 1200);
      }, 1800);
    }, 200);"""

content = content.replace(old_payment_confirm_indices, new_payment_confirm_indices)

# Replace the initial goTo(5) trigger in confirmPayment to goTo(6)
content = content.replace("goTo(5); // Go to loading screen", "goTo(6); // Go to loading screen")

# 10. Update JS labels, array size and controls limit (index >= 6 instead of index >= 5)
old_js_labels = """  const labels = [
    'Konum ve mesafe',
    'Harita + yakında',
    'Tam liste',
    'Mağaza detayı',
    'Rezervasyon / ödeme',
    'Ödeme alınıyor',
    'Onay',
  ];"""

new_js_labels = """  const labels = [
    'Konum ve mesafe',
    'Keşfet',
    'Harita + yakında',
    'Tam liste',
    'Mağaza detayı',
    'Rezervasyon / ödeme',
    'Ödeme alınıyor',
    'Onay',
  ];"""
content = content.replace(old_js_labels, new_js_labels)

content = content.replace("if (current >= 5) {", "if (current >= 6) {")

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
