with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's do exact replacements screen by screen to be 100% correct

# --- SCREEN 0 ---
# "Bu konumu kullan" button -> goTo(1)
content = content.replace('class="action-btn" onclick="goTo(1)"', 'class="action-btn" onclick="goTo(1)"')

# --- SCREEN 1 (Keşfet) ---
# Cards:
# Boojum card:
content = content.replace('onclick="goTo(5)"', 'onclick="goTo(4)"') # Will affect all card clicks that became 5

# Let's fix the tab bar inside Screen 1 (Keşfet)
old_tab_s1 = """        <!-- Tab Bar -->
        <div class="tab-bar" style="flex-shrink: 0; z-index: 10;">
          <button class="tab-active" onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button onclick="goTo(3)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>"""

new_tab_s1 = """        <!-- Tab Bar -->
        <div class="tab-bar" style="flex-shrink: 0; z-index: 10;">
          <button class="tab-active" onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button onclick="goTo(2)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>"""
content = content.replace(old_tab_s1, new_tab_s1)

# --- SCREEN 2 (Göz At - Harita) ---
# List toggle in Screen 2:
content = content.replace('onclick="goTo(5)" class="tgtg-icon-btn" style="background: #fff; border: none; border-radius: 8px; width: 2.8rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" title="Liste Görünümü"',
                          'onclick="goTo(3)" class="tgtg-icon-btn" style="background: #fff; border: none; border-radius: 8px; width: 2.8rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" title="Liste Görünümü"')

# Tab bar on Screen 2:
old_tab_s2 = """        <div class="tab-bar">
          <button onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button class="tab-active" onclick="goTo(2)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>"""

new_tab_s2 = """        <div class="tab-bar">
          <button onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button class="tab-active" onclick="goTo(2)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>"""
# (Already looks correct, but let's be sure)

# --- SCREEN 3 (Göz At - Liste) ---
# Map toggle in Screen 3 header:
old_header_s3 = 'onclick="goTo(3)" style="background: none; border: none; cursor: pointer; width: 2.8rem; height: 2.8rem; display: flex; align-items: center; justify-content: center;" title="Harita Görünümü"'
new_header_s3 = 'onclick="goTo(2)" style="background: none; border: none; cursor: pointer; width: 2.8rem; height: 2.8rem; display: flex; align-items: center; justify-content: center;" title="Harita Görünümü"'
content = content.replace(old_header_s3, new_header_s3)

# Tab bar on Screen 3:
old_tab_s3 = """        <div class="tab-bar">
          <button onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button class="tab-active" onclick="goTo(2)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>"""

new_tab_s3 = """        <div class="tab-bar">
          <button onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button class="tab-active" onclick="goTo(3)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>"""
content = content.replace(old_tab_s3, new_tab_s3)

# --- SCREEN 4 (Mağaza detayı) ---
# Back button:
content = content.replace('<button class="icon-btn" onclick="goTo(3)">←</button>', '<button class="icon-btn" onclick="goTo(3)">←</button>') # Ensure it is goTo(3)
# Rezerve et button:
content = content.replace('onclick="goTo(4)"', 'onclick="goTo(5)"') # Ensure rezerve et button is goTo(5)

# --- SCREEN 5 (Rezervasyon / ödeme) ---
# Back button:
content = content.replace('<button class="icon-btn" onclick="goTo(4)" style="width: 32px; height: 32px;', '<button class="icon-btn" onclick="goTo(4)" style="width: 32px; height: 32px;')

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
