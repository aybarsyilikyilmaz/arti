with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the CSS for tab bar buttons to support SVG color inherit and transitions
old_css = """  .tab-bar button {
    background: none; border: 0; display: flex; flex-direction: column;
    align-items: center; gap: 0.2rem; font-size: 0.62rem; font-weight: 600;
    color: var(--app-muted); font-family: inherit; cursor: pointer;
  }
  .tab-bar button.tab-active span { font-weight: 700; color: var(--brand-dark); }"""

new_css = """  .tab-bar button {
    background: none; border: 0; display: flex; flex-direction: column;
    align-items: center; gap: 0.35rem; font-size: 0.65rem; font-weight: 600;
    color: var(--app-muted); font-family: inherit; cursor: pointer;
    transition: color 0.15s ease;
  }
  .tab-bar button.tab-active { color: var(--brand-dark); }
  .tab-bar button.tab-active span { font-weight: 700; }
  .tab-bar button.tab-active .fill-active { fill: currentColor; }
  .tab-bar .tab-icon {
    display: block;
    transition: transform 0.12s ease;
  }
  .tab-bar button:active .tab-icon {
    transform: scale(0.9);
  }"""

content = content.replace(old_css, new_css)

# Define premium SVG strings
icon_discover_active = """<svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon class="fill-active" points="16.24 7.76 14.12 14.12 7.76 16.24 8.88 9.88 16.24 7.76"></polygon>
          </svg>"""

icon_discover_inactive = """<svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 8.88 9.88 16.24 7.76"></polygon>
          </svg>"""

icon_browse_active = """<svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
            <line x1="9" y1="3" x2="9" y2="18"></line>
            <line x1="15" y1="6" x2="15" y2="21"></line>
          </svg>"""

icon_browse_inactive = """<svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
            <line x1="9" y1="3" x2="9" y2="18"></line>
            <line x1="15" y1="6" x2="15" y2="21"></line>
          </svg>"""

icon_favorites = """<svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path class="fill-active" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>"""

icon_profile = """<svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle class="fill-active" cx="12" cy="7" r="4"></circle>
          </svg>"""

# --- Replace Screen 1 Tab Bar ---
screen1_tabbar_old = """        <div class="tab-bar" style="flex-shrink: 0; z-index: 10;">
          <button class="tab-active" onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button onclick="goTo(2)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>"""

screen1_tabbar_new = f"""        <div class="tab-bar" style="flex-shrink: 0; z-index: 10;">
          <button class="tab-active" onclick="goTo(1)">
            {icon_discover_active}
            <span>Keşfet</span>
          </button>
          <button onclick="goTo(2)">
            {icon_browse_inactive}
            <span>Göz At</span>
          </button>
          <button onclick="alert('Favoriler sayfası yakında!')">
            {icon_favorites}
            <span>Favoriler</span>
          </button>
          <button onclick="alert('Profil sayfası yakında!')">
            {icon_profile}
            <span>Profil</span>
          </button>
        </div>"""

content = content.replace(screen1_tabbar_old, screen1_tabbar_new)

# --- Replace Screen 2 Tab Bar ---
screen2_tabbar_old = """        <div class="tab-bar">
          <button onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button class="tab-active" onclick="goTo(3)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>"""

screen2_tabbar_new = f"""        <div class="tab-bar">
          <button onclick="goTo(1)">
            {icon_discover_inactive}
            <span>Keşfet</span>
          </button>
          <button class="tab-active" onclick="goTo(3)">
            {icon_browse_active}
            <span>Göz At</span>
          </button>
          <button onclick="alert('Favoriler sayfası yakında!')">
            {icon_favorites}
            <span>Favoriler</span>
          </button>
          <button onclick="alert('Profil sayfası yakında!')">
            {icon_profile}
            <span>Profil</span>
          </button>
        </div>"""

content = content.replace(screen2_tabbar_old, screen2_tabbar_new)

# --- Replace Screen 3 Tab Bar ---
screen3_tabbar_old = """        <div class="tab-bar">
          <button onclick="goTo(1)">🧭<span>Keşfet</span></button>
          <button class="tab-active" onclick="goTo(3)">🗺️<span>Göz At</span></button>
          <button onclick="alert('Favoriler sayfası yakında!')">♡<span>Favoriler</span></button>
          <button onclick="alert('Profil sayfası yakında!')">👤<span>Profil</span></button>
        </div>"""

screen3_tabbar_new = f"""        <div class="tab-bar">
          <button onclick="goTo(1)">
            {icon_discover_inactive}
            <span>Keşfet</span>
          </button>
          <button class="tab-active" onclick="goTo(3)">
            {icon_browse_active}
            <span>Göz At</span>
          </button>
          <button onclick="alert('Favoriler sayfası yakında!')">
            {icon_favorites}
            <span>Favoriler</span>
          </button>
          <button onclick="alert('Profil sayfası yakında!')">
            {icon_profile}
            <span>Profil</span>
          </button>
        </div>"""

# Replace in content (since screen 2 and 3 had the exact same old string, we replace them cleanly)
content = content.replace(screen3_tabbar_old, screen3_tabbar_new)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully replaced all emojis with premium vector SVGs!")
