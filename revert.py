import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Screen 0 with the original Map screen
screen0_replacement = """      <!-- ============ SCREEN 0 — Konum / mesafe seçimi ============ -->
      <section class="screen active" id="screen-0">
        <div class="status-bar">
          <span>9:41</span>
          <span class="status-icons">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><rect x="0" y="7" width="2.5" height="4" rx="0.5" fill="currentColor"/><rect x="4.5" y="5" width="2.5" height="6" rx="0.5" fill="currentColor"/><rect x="9" y="3" width="2.5" height="8" rx="0.5" fill="currentColor"/><rect x="13.5" y="0" width="2.5" height="11" rx="0.5" fill="currentColor"/></svg>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="15" height="8" rx="1.2" fill="currentColor"/><rect x="21.5" y="3.5" width="1.6" height="5" rx="0.8" fill="currentColor"/></svg>
          </span>
        </div>
        <div class="screen-body">
          <p style="text-align:center;font-weight:700;padding:0.8rem 1.4rem 0.4rem;font-size:0.98rem;">Sürpriz kutular bulmak için<br/>bir konum seçin</p>
          <div class="radius-stage" id="map-container" style="z-index: 1;">
            <!-- Real Leaflet Map -->
          </div>
          <div class="sheet">
            <h3>Mesafe seçin</h3>
            <div class="slider-row"><span>Yakın</span><output id="km-output">11 km</output></div>
            <input type="range" min="1" max="30" value="11" id="km-slider" aria-label="Mesafe" />
            <div class="search-field">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              Adres veya semt ara
            </div>
            <button class="pill-btn" style="width:100%; margin-bottom:1rem; background:var(--app-bg); color:var(--app-text); border:1.5px solid var(--app-line);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.4rem; vertical-align:-3px;"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
              Mevcut konumumu kullan <span style="float:right; opacity:0.5;">›</span>
            </button>
            <button class="pill-btn" style="width:100%;" onclick="goTo(1)">Bu konumu kullan</button>
          </div>
        </div>
      </section>"""

# Replace Screen 1 with the old map screen
screen1_replacement = """      <!-- ============ SCREEN 1 — Harita + yakında ============ -->
      <section class="screen" id="screen-1">
        <div class="status-bar" style="padding-top:0.7rem;">
          <span>9:41</span>
          <span class="status-icons">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><rect x="0" y="7" width="2.5" height="4" rx="0.5" fill="currentColor"/><rect x="4.5" y="5" width="2.5" height="6" rx="0.5" fill="currentColor"/><rect x="9" y="3" width="2.5" height="8" rx="0.5" fill="currentColor"/><rect x="13.5" y="0" width="2.5" height="11" rx="0.5" fill="currentColor"/></svg>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="15" height="8" rx="1.2" fill="currentColor"/><rect x="21.5" y="3.5" width="1.6" height="5" rx="0.8" fill="currentColor"/></svg>
          </span>
        </div>
        <div class="screen-body" style="overflow:hidden;">
          <div class="map-half">
            <svg viewBox="0 0 300 200" preserveAspectRatio="none">
              <path d="M0 40 Q90 10 150 55 T300 30" stroke="#a9c2b5" stroke-width="10" fill="none" opacity="0.7"/>
              <path d="M0 150 Q110 190 220 140 T300 165" stroke="#a9c2b5" stroke-width="12" fill="none" opacity="0.6"/>
              <path d="M40 0 L60 200" stroke="#c3d6cb" stroke-width="6"/>
              <path d="M180 0 L160 200" stroke="#c3d6cb" stroke-width="6"/>
              <path d="M0 90 L300 100" stroke="#c3d6cb" stroke-width="6"/>
            </svg>
            <div class="map-top-row">
              <span class="map-chip">🔍</span>
              <span class="map-chip">⚙️ Filtrele</span>
            </div>
            <div class="map-pin" style="top:38%;left:28%;">📍</div>
            <div class="map-pin" style="top:30%;left:52%;">📍</div>
            <div class="map-pin" style="top:55%;left:68%;">📍</div>
            <div class="map-pin" style="top:70%;left:22%;">📍</div>
            <div class="map-pin" style="top:20%;left:78%;">📍</div>
          </div>
          <div class="nearby-sheet">
            <div class="grabber"></div>
            <h3>Yakınınızda 9 sürpriz kutu</h3>
            <div class="h-scroll">
              <button class="venue-card" onclick="goTo(3)">
                <div class="venue-art veg">🥗</div>
                <p class="name">Manolya Cafe</p>
                <p class="meta">📍 450 m &middot; Bugün 18:00</p>
                <div class="price-row"><span class="price-old">500 ₺</span><span class="price-new">250 ₺</span></div>
              </button>
              <button class="venue-card" onclick="goTo(3)">
                <div class="venue-art bakery">🥐</div>
                <p class="name">Papatya Cafe</p>
                <p class="meta">📍 700 m &middot; Bugün 17:00</p>
                <div class="price-row"><span class="price-old">400 ₺</span><span class="price-new">200 ₺</span></div>
              </button>
              <button class="venue-card" onclick="goTo(3)">
                <div class="venue-art veg">🍅</div>
                <p class="name">Lale Cafe</p>
                <p class="meta">📍 1.2 km &middot; Yarın 18:00</p>
                <div class="price-row"><span class="price-old">500 ₺</span><span class="price-new">250 ₺</span></div>
              </button>
            </div>
          </div>
        </div>
        <div class="tab-bar">
          <button>🧭<span>Keşfet</span></button>
          <button class="tab-active">🗺️<span>Göz At</span></button>
          <button>♡<span>Favoriler</span></button>
          <button>👤<span>Profil</span></button>
        </div>
      </section>"""

# Replace Screen 2 with the Yemeksepeti list
screen2_replacement = """      <!-- ============ SCREEN 2 — Tam liste (Yemeksepeti Style) ============ -->
      <section class="screen" id="screen-2">
        <div class="status-bar">
          <span>9:41</span>
          <span class="status-icons">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><rect x="0" y="7" width="2.5" height="4" rx="0.5" fill="currentColor"/><rect x="4.5" y="5" width="2.5" height="6" rx="0.5" fill="currentColor"/><rect x="9" y="3" width="2.5" height="8" rx="0.5" fill="currentColor"/><rect x="13.5" y="0" width="2.5" height="11" rx="0.5" fill="currentColor"/></svg>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="15" height="8" rx="1.2" fill="currentColor"/><rect x="21.5" y="3.5" width="1.6" height="5" rx="0.8" fill="currentColor"/></svg>
          </span>
        </div>
        <div class="header-row" style="padding: 0.8rem 1.4rem 0.4rem; justify-content: center; position: relative;">
          <div style="text-align:center;">
            <p style="font-size:0.75rem; color: var(--app-muted); font-weight:700; margin:0; text-transform:uppercase; letter-spacing:0.05em;">Teslimat Adresi</p>
            <p style="font-size:0.95rem; font-weight:800; margin:0;">Kadıköy, İstanbul ▾</p>
          </div>
        </div>
        <div style="padding: 0.5rem 1.4rem 0;">
          <div class="search-field" style="margin-bottom: 0.8rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            Kafe veya ürün ara
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-chip on">Tümü</span>
          <span class="filter-chip">Fırın</span>
          <span class="filter-chip">Kafe</span>
          <span class="filter-chip">Market</span>
          <span class="filter-chip">Vejetaryen</span>
        </div>
        <div class="screen-body" style="padding: 0 1.4rem 2rem; display: flex; flex-direction: column; gap: 1.2rem; overflow-y: auto;">
          <button class="venue-card-large" onclick="goTo(3)">
            <div class="card-img" style="background-image: url('manolya.jpg');"></div>
            <div class="card-info">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h3 class="name">Manolya Cafe</h3>
                <span class="rating">★ 4.4</span>
              </div>
              <p class="meta">Vejetaryen &middot; 450 m &middot; Teslimat: Bugün 18:00</p>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                <span class="tag-chip">Hızla tükeniyor</span>
                <div class="prices" style="flex-direction:row; gap:0.5rem; align-items:baseline;">
                  <span class="price-old" style="font-size:0.9rem;">500 ₺</span>
                  <span class="price-new" style="font-size:1.1rem;">250 ₺</span>
                </div>
              </div>
            </div>
          </button>

          <button class="venue-card-large" onclick="goTo(3)">
            <div class="card-img" style="background-image: url('papatya.jpg');"></div>
            <div class="card-info">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h3 class="name">Papatya Fırın</h3>
                <span class="rating">★ 4.8</span>
              </div>
              <p class="meta">Fırın &middot; 700 m &middot; Teslimat: Bugün 17:00</p>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                <span class="tag-chip">2 kutu kaldı</span>
                <div class="prices" style="flex-direction:row; gap:0.5rem; align-items:baseline;">
                  <span class="price-old" style="font-size:0.9rem;">400 ₺</span>
                  <span class="price-new" style="font-size:1.1rem;">200 ₺</span>
                </div>
              </div>
            </div>
          </button>

          <button class="venue-card-large" onclick="goTo(3)">
            <div class="card-img" style="background-image: url('defne.jpg');"></div>
            <div class="card-info">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h3 class="name">Defne Kahve</h3>
                <span class="rating">★ 4.5</span>
              </div>
              <p class="meta">Kahve &middot; 1.5 km &middot; Teslimat: Yarın 09:00</p>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem;">
                <span class="tag-chip">Yeni</span>
                <div class="prices" style="flex-direction:row; gap:0.5rem; align-items:baseline;">
                  <span class="price-old" style="font-size:0.9rem;">300 ₺</span>
                  <span class="price-new" style="font-size:1.1rem;">150 ₺</span>
                </div>
              </div>
            </div>
          </button>
        </div>
        <div class="tab-bar">
          <button>🧭<span>Keşfet</span></button>
          <button>🗺️<span>Göz At</span></button>
          <button>♡<span>Favoriler</span></button>
          <button class="tab-active">👤<span>Profil</span></button>
        </div>
      </section>"""

content = re.sub(r'<!-- ============ SCREEN 0.*?<!-- ============ SCREEN 3', 
                 screen0_replacement + '\n\n' + screen1_replacement + '\n\n' + screen2_replacement + '\n\n      <!-- ============ SCREEN 3', 
                 content, flags=re.DOTALL)

# Fix CSS
css_fixes = """  /* ===========================================================
     SCREEN 0 — Ana Sayfa
  =========================================================== */
  #screen-0 .screen-body { display: flex; flex-direction: column; }
  .radius-stage {
    position: relative; margin: 0.4rem 1.1rem 1rem; flex: 1; min-height: 0;
    border-radius: 1.8rem; overflow: hidden;
  }
  .custom-bubble {
    background: #1b4d36; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; box-shadow: 0 4px 10px rgba(27,77,54,0.3); border: 2px solid #fff;
  }
  .bubble.near { width: 2rem; height: 2rem; font-size: 0.68rem; background: #1b4d36; }
  .bubble.mid { width: 1.6rem; height: 1.6rem; font-size: 0.6rem; background: #2a684b; }
  .bubble.far { width: 1.3rem; height: 1.3rem; font-size: 0.55rem; background: var(--brand); opacity: 0.75; }

  .sheet {
    flex: none; background: transparent; padding: 0.5rem 1.4rem 0.5rem;
    position: relative; z-index: 3;
  }
"""

content = re.sub(r'/\* ===========================================================\n     SCREEN 0 — Ana Sayfa\n  =========================================================== \*/\n  \.sheet \{', css_fixes, content)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
