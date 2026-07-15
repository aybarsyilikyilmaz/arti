import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix CSS
css_search = r"""  \.sheet \{.*?  \}"""
css_replace = """  .sheet {
    flex: none; background: #ffffff; padding: 1.4rem 1.4rem 1rem;
    position: relative; z-index: 3;
    border-radius: 1.8rem 1.8rem 0 0;
    box-shadow: 0 -10px 40px rgba(0,0,0,0.06);
    margin-top: -1.2rem;
  }
  .sheet::before {
    content: ''; display: block; width: 2.5rem; height: 0.3rem; 
    background: var(--app-line); border-radius: 999px; margin: 0 auto 1.2rem;
  }
  .sheet h3 { margin: 0 0 1.2rem; font-size: 0.8rem; text-align: left; font-weight: 800; letter-spacing: 0.05em; color: var(--app-muted); text-transform: uppercase; }
  
  .slider-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; }
  .slider-row span { font-weight: 700; color: #111; font-size: 1rem; }
  .slider-row output { font-weight: 800; font-size: 1.2rem; font-variant-numeric: tabular-nums; color: var(--brand); }
  
  input[type="range"] {
    -webkit-appearance: none; width: 100%; margin: 0.8rem 0 1.8rem; background: transparent;
  }
  input[type="range"]::-webkit-slider-runnable-track {
    width: 100%; height: 8px; background: #e8f0eb; border-radius: 4px; border: none;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; border: 3px solid #fff; height: 24px; width: 24px; border-radius: 50%;
    background: var(--brand); margin-top: -8px; box-shadow: 0 4px 12px rgba(45, 106, 79, 0.3);
    cursor: grab;
  }
  
  .search-field {
    display: flex; align-items: center; gap: 0.8rem; background: #f5f8f6;
    border: 1px solid transparent; border-radius: 1.2rem; padding: 1rem 1.2rem;
    color: #111; font-size: 0.95rem; font-weight: 600; margin-bottom: 0.8rem;
    transition: all 0.2s ease;
  }
  .search-field:hover { background: #fff; border-color: var(--brand-tint); box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
  .search-field svg { flex: none; color: var(--brand); }
  
  .locate-btn {
    display: flex; align-items: center; gap: 0.8rem; background: #fff;
    border: 1px solid var(--app-line); border-radius: 1.2rem; padding: 1rem 1.2rem;
    color: #111; font-size: 0.95rem; font-weight: 600; margin-bottom: 1.5rem;
    width: 100%; text-align: left; cursor: pointer; transition: all 0.2s ease;
  }
  .locate-btn:hover { background: #f9fbf9; border-color: #d1dfd6; }
  .locate-btn .icon-box {
    width: 2rem; height: 2rem; border-radius: 50%; background: var(--brand-tint);
    display: flex; align-items: center; justify-content: center; color: var(--brand-dark);
  }
  
  .action-btn {
    width: 100%; background: linear-gradient(135deg, var(--brand), var(--brand-dark));
    color: #fff; border: none; border-radius: 1.2rem; padding: 1.1rem;
    font-size: 1rem; font-weight: 700; cursor: pointer;
    box-shadow: 0 8px 20px rgba(45, 106, 79, 0.25); transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .action-btn:active { transform: scale(0.98); box-shadow: 0 4px 10px rgba(45, 106, 79, 0.2); }
"""

# We need to replace from .sheet { to .search-field svg { flex: none; color: var(--app-muted); }
content = re.sub(r'\.sheet \{.*\.search-field svg \{ flex: none; color: var\(--app-muted\); \}', css_replace, content, flags=re.DOTALL)

# Fix HTML
html_search = r"""          <div class="sheet">.*?</div>"""
html_replace = """          <div class="sheet">
            <h3>Mesafe Seçin</h3>
            <div class="slider-row"><span>Yakın</span><output id="km-output">11 km</output></div>
            <input type="range" min="1" max="30" value="11" id="km-slider" aria-label="Mesafe" />
            
            <div class="search-field">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              Adres veya semt ara
            </div>
            
            <button class="locate-btn">
              <div class="icon-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
              </div>
              <span style="flex:1;">Mevcut konumumu kullan</span>
              <span style="color:var(--app-muted); font-size:1.2rem;">›</span>
            </button>
            
            <button class="action-btn" onclick="goTo(1)">Bu konumu kullan</button>
          </div>"""

# Replace the specific sheet div in screen-0
# The closing tags in original are:
#             <button class="pill-btn" style="width:100%;" onclick="goTo(1)">Bu konumu kullan</button>
#           </div>
content = re.sub(r'          <div class="sheet">.*?<button class="pill-btn" style="width:100%;" onclick="goTo\(1\)">Bu konumu kullan</button>\n          </div>', html_replace, content, flags=re.DOTALL)


with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
