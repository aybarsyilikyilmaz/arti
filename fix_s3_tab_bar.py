with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_tab_bar = """        <div class="tab-bar">
          <button>🧭<span>Keşfet</span></button>
          <button>🗺️<span>Göz At</span></button>
          <button>♡<span>Favoriler</span></button>
          <button class="tab-active">👤<span>Profil</span></button>
        </div>"""

new_tab_bar = """        <div class="tab-bar">
          <button onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button class="tab-active" onclick="goTo(3)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>"""

content = content.replace(old_tab_bar, new_tab_bar)

# Also fix Screen 2 (Map) tab bar to go to goTo(2) instead of goTo(3)
content = content.replace('class="tab-active" onclick="goTo(3)"', 'class="tab-active" onclick="goTo(2)"')

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
