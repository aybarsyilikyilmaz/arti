with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the CSS for cursor hiding to be triggered by .hide-cursor class instead of body.recording-mode
old_cursor_css = """  body.recording-mode {
    background: #ffffff !important;
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    cursor: none !important; /* Hides mouse cursor completely inside the window when in recording mode */
  }
  body.recording-mode * {
    cursor: none !important; /* Force hide cursor on all child elements/buttons */
  }"""

new_cursor_css = """  body.recording-mode {
    background: #ffffff !important;
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  /* Independent cursor hiding toggled by 'H' key */
  body.hide-cursor,
  body.hide-cursor * {
    cursor: none !important;
  }"""

content = content.replace(old_cursor_css, new_cursor_css)

# 2. Update the javascript listener block
old_js_block = """  // Toggle Recording Mode via 'k' key
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'k') {
      document.body.classList.toggle('recording-mode');
      
      // Invalidate Leaflet maps to prevent resizing glitches in transition
      if (typeof map !== 'undefined') {
        setTimeout(() => map.invalidateSize(), 150);
      }
      if (typeof map2 !== 'undefined') {
        setTimeout(() => map2.invalidateSize(), 150);
      }
    }
  });"""

new_js_block = """  // Advanced Presentation & Recording Controls
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    // 1. 'K' to toggle Recording Mode
    if (key === 'k') {
      document.body.classList.toggle('recording-mode');
      if (typeof map !== 'undefined') {
        setTimeout(() => map.invalidateSize(), 150);
      }
      if (typeof map2 !== 'undefined') {
        setTimeout(() => map2.invalidateSize(), 150);
      }
    }
    
    // 2. 'H' to hide/show the mouse cursor dynamically
    if (key === 'h') {
      document.body.classList.toggle('hide-cursor');
    }
    
    // 3. '1' to '8' keys to switch screens instantly (perfect for mouse-free demo presentations!)
    if (e.key >= '1' && e.key <= '8') {
      const targetIndex = parseInt(e.key) - 1;
      if (typeof goTo === 'function') {
        goTo(targetIndex);
      }
    }
  });"""

content = content.replace(old_js_block, new_js_block)

# 4. Update the helper badge text in HTML to reflect new hotkeys
old_badge = """<!-- Floating helper badge for recording -->
<div class="recording-tip">
  <span>📹 Kayıt Modu: Çerçeveyi gizlemek/dikdörtgen yapmak için klavyeden <b>K</b> tuşuna basın.</span>
</div>"""

new_badge = """<!-- Floating helper badge for recording -->
<div class="recording-tip" style="flex-direction: column; align-items: flex-start; gap: 0.25rem; border-radius: 12px; line-height: 1.4;">
  <div>📹 <b>K</b> : Kayıt Modu (Düz dikdörtgen ekran)</div>
  <div>🖱️ <b>H</b> : Fare imlecini gizle / göster</div>
  <div>🔢 <b>1 - 8</b> : Ekranlar arası geçiş yap (Sunum için)</div>
</div>"""

content = content.replace(old_badge, new_badge)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated prototype to support advanced keyboard controls and toggleable cursor!")
