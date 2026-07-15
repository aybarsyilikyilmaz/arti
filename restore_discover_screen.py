with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the start and end markers
start_marker = "<!-- ============ SCREEN 1 — Keşfet (TGTG Discover style) ============ -->"
end_marker = "<!-- ============ SCREEN 2 — Harita + yakında (TGTG Style) ============ -->"

# Find the indices of the markers in the file
start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Error: Could not find screen markers!")
    exit(1)

# Construct the fresh, clean, verified screen HTML
clean_screen_html = """<!-- ============ SCREEN 1 — Keşfet (TGTG Discover style) ============ -->
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
        <div style="background: #fff; padding: 0.6rem 1rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; cursor: pointer; z-index: 10;" onclick="goTo(1)">
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
                </div>
                <div style="padding: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
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
                <div style="position: relative; height: 125px; background-image: url('manolya.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">2 adet kaldı</div>
                  <div style="position: absolute; top: 8px; right: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; display: flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">★ 4.8</div>
                </div>
                <div style="padding: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
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

              <!-- Card 3: Sushi Star -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('sushi_platter.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Hızla tükeniyor</div>
                  <div style="position: absolute; top: 8px; right: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; display: flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">★ 4.6</div>
                </div>
                <div style="padding: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Sushi Star - Moda</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Premium Sushi Sürpriz Kutu</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Bugün 21:00 - 22:30</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>950 m</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">600 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">300 ₺</span>
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
              
              <!-- Card 1: Papatya Fırın -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column; height: 210px;" onclick="goTo(4)">
                <div style="position: relative; height: 110px; background-image: url('papatya.jpg'); background-size: cover; background-position: center;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Çok beğenilen</div>
                </div>
                <div style="padding: 0.8rem; display: flex; flex-direction: column; gap: 0.1rem; flex: 1; justify-content: space-between;">
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

              <!-- Card 2: Defne Kahve -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column; height: 210px;" onclick="goTo(4)">
                <div style="position: relative; height: 110px; background-image: url('defne.jpg'); background-size: cover; background-position: center;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Popüler</div>
                </div>
                <div style="padding: 0.8rem; display: flex; flex-direction: column; gap: 0.1rem; flex: 1; justify-content: space-between;">
                  <div>
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111;">Defne Kahve</h4>
                    <span style="font-size: 0.75rem; color: #666;">Kahve & Tatlı Kutusu</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.1rem;">
                    <span style="font-size: 0.75rem; color: #777;">650m &bull; Bugün 19:00</span>
                    <div style="display: flex; gap: 0.3rem; align-items: center;">
                      <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">350 ₺</span>
                      <span style="font-size: 0.9rem; font-weight: 800; color: #006256;">175 ₺</span>
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
                </div>
                <div style="padding: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
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

              <!-- Card 2: Burger Box -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('gourmet_burger.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #d32f2f; color: #fff; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">1 adet kaldı</div>
                  <div style="position: absolute; top: 8px; right: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; display: flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">★ 4.5</div>
                </div>
                <div style="padding: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Burger Box - Kadıköy</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Double Burger & Patates Kutusu</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Bugün 22:00 - 23:30</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>1.1 km</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">500 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">250 ₺</span>
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
                </div>
                <div style="padding: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
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

              <!-- Card 2: Antepli Tatlıcı -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('turkish_baklava.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #006256; color: #fff; font-weight: 800; font-size: 0.75rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Yeni</div>
                  <div style="position: absolute; top: 8px; right: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; display: flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">★ 4.9</div>
                </div>
                <div style="padding: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Antepli Tatlıcı</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Fıstıklı Baklava & Şöbiyet Kutusu</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Bugün 20:00 - 22:00</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>1.5 km</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">400 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">200 ₺</span>
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

# Replace the region in content
prefix = content[:start_idx]
suffix = content[end_idx + len(end_marker):]

new_content = prefix + clean_screen_html + suffix

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully restored Discover screen HTML!")
