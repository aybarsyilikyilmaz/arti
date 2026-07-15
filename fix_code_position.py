import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove pickup-code-display from its old position and place it below the map box
old_block_search = r"""            <p id="pickup-code-display" style="margin: 0 0 1.5rem; font-size: 0.95rem; font-weight: 800; color: #1E8E7D; text-align: center; letter-spacing: 0.5px;">TESLİM ALMA KODU: AR-8492</p>
            
            <p style="margin: 0 0 0.3rem; font-size: 1.05rem; font-weight: 700; color: #111; text-align: center;">Manolya Cafe - Kadıköy, İstanbul</p>
            <p style="margin: 0 0 1.5rem; font-size: 0.95rem; color: #555; text-align: center;">Bugün teslim alın 18:00 - 18:30</p>"""

new_block_replace = """            <p style="margin: 0 0 0.3rem; font-size: 1.05rem; font-weight: 700; color: #111; text-align: center;">Manolya Cafe - Kadıköy, İstanbul</p>
            <p style="margin: 0 0 1.5rem; font-size: 0.95rem; color: #555; text-align: center;">Bugün teslim alın 18:00 - 18:30</p>"""

content = content.replace(old_block_search, new_block_replace)

# 2. Add the code display below the map box inside Screen 6
map_box_end = """              <button style="width: 100%; background: #f9f9f9; border: none; padding: 1rem; font-weight: 700; font-size: 1rem; color: #222; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-top: 1px solid #e0e0e0;">
                Yol Tarifi Al
                <svg width="18" height="18" viewBox="0 0 24 24" fill='none' stroke="#666" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>"""

map_box_end_new = """              <button style="width: 100%; background: #f9f9f9; border: none; padding: 1rem; font-weight: 700; font-size: 1rem; color: #222; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-top: 1px solid #e0e0e0;">
                Yol Tarifi Al
                <svg width="18" height="18" viewBox="0 0 24 24" fill='none' stroke="#666" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            
            <div style="margin-top: 1.5rem; text-align: center; border-top: 1px dashed #eee; padding-top: 1.2rem;">
              <p id="pickup-code-display" style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #1E8E7D; letter-spacing: 2px;">TESLİM ALMA KODU: 849204</p>
            </div>"""

content = content.replace(map_box_end, map_box_end_new)

# 3. Update confirmPayment JS function to generate a 6-digit random code and update QR value
old_js_code = """        // Generate real random pickup code
        const randomCode = 'AR-' + Math.floor(1000 + Math.random() * 9000);
        document.getElementById('pickup-code-display').textContent = 'TESLİM ALMA KODU: ' + randomCode;
        
        // Generate REAL QR Code using QRious library on the canvas
        new QRious({
          element: document.getElementById('qr-canvas'),
          value: 'https://artiapp.com/order/' + randomCode,
          size: 160,
          background: '#ffffff',
          foreground: '#21261f',
          level: 'H'
        });"""

new_js_code = """        // Generate real 6-digit random pickup code (e.g. 749204)
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        document.getElementById('pickup-code-display').textContent = 'TESLİM ALMA KODU: ' + randomCode;
        
        // Generate REAL QR Code using QRious library on the canvas
        new QRious({
          element: document.getElementById('qr-canvas'),
          value: 'https://artiapp.com/order/' + randomCode,
          size: 160,
          background: '#ffffff',
          foreground: '#21261f',
          level: 'H'
        });"""

content = content.replace(old_js_code, new_js_code)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
