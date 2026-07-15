import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix CSS
css_search = r"""  \.sheet \{.*?  \.action-btn:active \{ transform: scale\(0.98\); box-shadow: 0 4px 10px rgba\(45, 106, 79, 0.2\); \}"""
css_replace = """  .sheet {
    flex: none; background: #ffffff; padding: 1.5rem 1.4rem 1.5rem;
    position: relative; z-index: 3;
    border-radius: 1.5rem 1.5rem 0 0;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
    margin-top: -1.2rem;
  }
  .sheet h3 { margin: 0 0 1.2rem; font-size: 0.95rem; text-align: center; font-weight: 800; color: #000; }
  
  .slider-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
  
  .slider-container {
    display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;
  }
  input[type="range"] {
    -webkit-appearance: none; flex: 1; background: transparent;
  }
  input[type="range"]::-webkit-slider-runnable-track {
    width: 100%; height: 4px; background: #e0e0e0; border-radius: 2px; border: none;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; border: none; height: 24px; width: 24px; border-radius: 50%;
    background: #fff; margin-top: -10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    cursor: grab;
  }
  .slider-val { font-size: 0.9rem; color: #333; font-weight: 500; min-width: 2.5rem; text-align: right; }
  
  .search-field {
    display: flex; align-items: center; gap: 0.6rem; background: #f2f2f2;
    border: none; border-radius: 999px; padding: 0.85rem 1.2rem;
    color: #333; font-size: 0.95rem; font-weight: 500; margin-bottom: 1.2rem;
  }
  .search-field svg { flex: none; color: #555; }
  
  .locate-btn {
    display: flex; align-items: center; justify-content: center; gap: 0.6rem;
    background: transparent; border: none; padding: 0.5rem;
    color: #0b5942; font-size: 0.95rem; font-weight: 700; margin-bottom: 1.5rem;
    width: 100%; cursor: pointer;
  }
  
  .action-btn {
    width: 100%; background: #0b5942;
    color: #fff; border: none; border-radius: 999px; padding: 1.1rem;
    font-size: 1rem; font-weight: 700; cursor: pointer;
  }
"""

content = re.sub(r'\.sheet \{.*\.action-btn:active \{[^\}]+\}', css_replace, content, flags=re.DOTALL)

# Fix HTML
html_replace = """          <div class="sheet">
            <h3>Mesafe seçin</h3>
            <div class="slider-container">
              <input type="range" min="1" max="30" value="11" id="km-slider" aria-label="Mesafe" />
              <div class="slider-val"><span id="km-output">11 km</span></div>
            </div>
            
            <div class="search-field">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <span style="flex:1;">Adres veya semt ara</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
            </div>
            
            <button class="locate-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/></svg>
              <span>Mevcut konumumu kullan</span>
            </button>
            
            <button class="action-btn" onclick="goTo(1)">Bu konumu kullan</button>
          </div>"""

content = re.sub(r'          <div class="sheet">.*?<button class="action-btn" onclick="goTo\(1\)">Bu konumu kullan</button>\n          </div>', html_replace, content, flags=re.DOTALL)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
