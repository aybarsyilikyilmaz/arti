import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Screen 1 HTML
html_search = r"""      <!-- ============ SCREEN 1 — Harita \+ yakında ============ -->
      <section class="screen" id="screen-1">.*?      </section>"""

html_replace = """      <!-- ============ SCREEN 1 — Harita + yakında (TGTG Style) ============ -->
      <section class="screen" id="screen-1">
        <div class="status-bar" style="position: absolute; top: 0; left: 0; right: 0; z-index: 10;">
          <span>9:41</span>
          <span class="status-icons">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><rect x="0" y="7" width="2.5" height="4" rx="0.5" fill="currentColor"/><rect x="4.5" y="5" width="2.5" height="6" rx="0.5" fill="currentColor"/><rect x="9" y="3" width="2.5" height="8" rx="0.5" fill="currentColor"/><rect x="13.5" y="0" width="2.5" height="11" rx="0.5" fill="currentColor"/></svg>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="15" height="8" rx="1.2" fill="currentColor"/><rect x="21.5" y="3.5" width="1.6" height="5" rx="0.8" fill="currentColor"/></svg>
          </span>
        </div>
        
        <div class="screen-body" style="position: relative; overflow: hidden; display: flex; flex-direction: column;">
          <!-- Map Background -->
          <div id="map-container-2" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 1; background: #e5e5e5;">
            <!-- Leaflet map 2 -->
          </div>
          
          <!-- Floating Top Bar -->
          <div class="floating-top-bar" style="position: relative; z-index: 4; display: flex; gap: 0.5rem; padding: 3rem 1rem 1rem;">
            <div class="tgtg-search" style="flex: 1; background: #fff; border-radius: 8px; display: flex; align-items: center; padding: 0.6rem 0.8rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input type="text" placeholder="Search" style="border: none; outline: none; width: 100%; margin-left: 0.5rem; font-size: 0.95rem;" />
            </div>
            <button class="tgtg-icon-btn" style="background: #fff; border: none; border-radius: 8px; width: 2.8rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </button>
            <button class="tgtg-icon-btn" style="background: #fff; border: none; border-radius: 8px; width: 2.8rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
            </button>
          </div>
          
          <button class="tgtg-float-locate" style="position: absolute; right: 1rem; bottom: 18rem; z-index: 4; background: #fff; border: none; border-radius: 50%; width: 2.8rem; height: 2.8rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>

          <div class="tgtg-sheet" style="margin-top: auto; position: relative; z-index: 3; background: #fff; border-radius: 1.2rem 1.2rem 0 0; box-shadow: 0 -4px 15px rgba(0,0,0,0.05); padding: 1rem 0 0;">
            <div class="grabber" style="width: 2.5rem; height: 3px; background: #ddd; border-radius: 3px; margin: 0 auto 1rem;"></div>
            <h3 style="text-align: center; font-size: 1.05rem; font-weight: 800; margin: 0 0 1rem; color: #000;">9 Surprise Bags</h3>
            
            <div class="tgtg-scroll" style="display: flex; gap: 1rem; padding: 0 1rem 1rem; overflow-x: auto; scrollbar-width: none;">
              
              <!-- Card 1 -->
              <div class="tgtg-card" style="flex: 0 0 85%; cursor: pointer;" onclick="goTo(3)">
                <div class="tgtg-img-wrap" style="position: relative; height: 11rem; border-radius: 12px; overflow: hidden; margin-bottom: 0.8rem; background-image: url('manolya.jpg'); background-size: cover; background-position: center;">
                  <div style="position: absolute; top: 0.6rem; left: 0.6rem; background: #ffdfba; color: #000; font-weight: 800; font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 999px;">2 left</div>
                  <div style="position: absolute; bottom: 0.6rem; left: 0.6rem; width: 2.2rem; height: 2.2rem; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">🥗</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h4 style="margin: 0 0 0.2rem; font-size: 1.1rem; font-weight: 800; color: #000;">Manolya Cafe</h4>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b5942" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <p style="margin: 0 0 0.3rem; font-size: 0.9rem; color: #555;">Salads & Healthy Bowls</p>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #555;">
                  <span>Pick up today 18:00 - 19:30</span>
                  <span>450 m</span>
                </div>
              </div>

              <!-- Card 2 -->
              <div class="tgtg-card" style="flex: 0 0 85%; cursor: pointer;" onclick="goTo(3)">
                <div class="tgtg-img-wrap" style="position: relative; height: 11rem; border-radius: 12px; overflow: hidden; margin-bottom: 0.8rem; background-image: url('papatya.jpg'); background-size: cover; background-position: center;">
                  <div style="position: absolute; top: 0.6rem; left: 0.6rem; background: #ffdfba; color: #000; font-weight: 800; font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 999px;">5 left</div>
                  <div style="position: absolute; bottom: 0.6rem; left: 0.6rem; width: 2.2rem; height: 2.2rem; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">🥐</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h4 style="margin: 0 0 0.2rem; font-size: 1.1rem; font-weight: 800; color: #000;">Papatya Fırın</h4>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b5942" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <p style="margin: 0 0 0.3rem; font-size: 0.9rem; color: #555;">Bakery Surprise Bag</p>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #555;">
                  <span>Pick up today 17:00 - 18:00</span>
                  <span>700 m</span>
                </div>
              </div>

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

content = re.sub(html_search, html_replace, content, flags=re.DOTALL)

# Add JS logic to initialize the second map
js_search = r"""    // Initialize Real Map
    const map = L\.map\('map-container'"""
    
js_replace = """    // Initialize Real Maps
    const map = L.map('map-container', { zoomControl: false, attributionControl: false, zoomSnap: 0 }).setView([40.988, 29.028], 14);
    
    // Create second map for screen-1
    const map2 = L.map('map-container-2', { zoomControl: false, attributionControl: false, zoomSnap: 0 }).setView([40.988, 29.028], 15);
    
    // Add Google Maps tiles to both
    const tileLayer1 = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    const tileLayer2 = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    
    tileLayer1.addTo(map);
    tileLayer2.addTo(map2);
    
    // Add pins to map2
    const iconHtml = `<div style="background:#0b5942;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);">3</div>`;
    locations.forEach(loc => {
      L.marker([loc.lat, loc.lng], {
        icon: L.divIcon({ html: iconHtml, className: '', iconSize: [24, 24] })
      }).addTo(map2);
    });

    // Remove the old CartoDB tile logic to avoid duplication
    /*"""

# We need to carefully replace the old initialization logic
content = re.sub(r'    // Initialize Real Map\n    const map = L\.map\(\'map-container\', \{.*?    \}\)\.setView\(\[40\.988, 29\.028\], 14\); // Kadıköy Boğa Heykeli Merkezi\n\n    L\.tileLayer\(\'http://\{s\}\.google\.com/vt/lyrs=m&x=\{x\}&y=\{y\}&z=\{z\}\', \{\n      maxZoom: 20,\n      subdomains: \[\'mt0\', \'mt1\', \'mt2\', \'mt3\'\]\n    \}\)\.addTo\(map\);', 
"""    // Initialize Real Maps
    const map = L.map('map-container', {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0
    }).setView([40.988, 29.028], 14);

    const map2 = L.map('map-container-2', {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0
    }).setView([40.988, 29.028], 14.5);

    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map2);""", content, flags=re.DOTALL)


# Also add map2.invalidateSize() when switching to screen 1
content = re.sub(r'if \(index === 1 && typeof map !== \'undefined\'\) \{\n        setTimeout\(\(\) => map\.invalidateSize\(\), 100\);\n      \}', 
"""if (index === 1 && typeof map2 !== 'undefined') {
        setTimeout(() => map2.invalidateSize(), 100);
      }""", content, flags=re.DOTALL)


with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
