with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS to remove body.hide-cursor and add touch-cursor styles + hide native cursor in recording mode
old_cursor_css = """  body.recording-mode {
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

new_cursor_css = """  body.recording-mode {
    background: #ffffff !important;
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  
  /* Hide native cursor in recording mode */
  body.recording-mode,
  body.recording-mode * {
    cursor: none !important;
  }

  /* Custom mobile touch cursor */
  .touch-cursor {
    display: none;
    position: fixed;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(45, 106, 79, 0.2);
    border: 2px solid rgba(45, 106, 79, 0.4);
    pointer-events: none;
    z-index: 1000000;
    transform: translate(-50%, -50%);
    transition: width 0.08s ease-out, height 0.08s ease-out, background-color 0.08s, border-color 0.08s;
  }
  body.recording-mode .touch-cursor {
    display: block;
  }
  .touch-cursor.active {
    width: 18px;
    height: 18px;
    background: rgba(45, 106, 79, 0.4);
    border-color: rgba(45, 106, 79, 0.6);
  }"""

content = content.replace(old_cursor_css, new_cursor_css)

# 2. Update JS listener to support mouse movement and clean up 'H' key
old_js_block = """  // Advanced Presentation & Recording Controls
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

new_js_block = """  // Create and append custom touch cursor
  const touchCursor = document.createElement('div');
  touchCursor.className = 'touch-cursor';
  document.body.appendChild(touchCursor);

  window.addEventListener('mousemove', (e) => {
    if (document.body.classList.contains('recording-mode')) {
      touchCursor.style.left = e.clientX + 'px';
      touchCursor.style.top = e.clientY + 'px';
    }
  });

  window.addEventListener('mousedown', () => {
    touchCursor.classList.add('active');
  });

  window.addEventListener('mouseup', () => {
    touchCursor.classList.remove('active');
  });

  // Advanced Presentation & Recording Controls
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
    
    // 2. '1' to '8' keys to switch screens instantly (perfect for mouse-free presentations)
    if (e.key >= '1' && e.key <= '8') {
      const targetIndex = parseInt(e.key) - 1;
      if (typeof goTo === 'function') {
        goTo(targetIndex);
      }
    }
  });"""

content = content.replace(old_js_block, new_js_block)

# 3. Update HTML helper badge to reflect touch cursor indicator
old_badge = """<!-- Floating helper badge for recording -->
<div class="recording-tip" style="flex-direction: column; align-items: flex-start; gap: 0.25rem; border-radius: 12px; line-height: 1.4;">
  <div>📹 <b>K</b> : Kayıt Modu (Düz dikdörtgen ekran)</div>
  <div>🖱️ <b>H</b> : Fare imlecini gizle / göster</div>
  <div>🔢 <b>1 - 8</b> : Ekranlar arası geçiş yap (Sunum için)</div>
</div>"""

new_badge = """<!-- Floating helper badge for recording -->
<div class="recording-tip" style="flex-direction: column; align-items: flex-start; gap: 0.25rem; border-radius: 12px; line-height: 1.4;">
  <div>📹 <b>K</b> : Kayıt Modu (Düz ekran + Dokunmatik imleç)</div>
  <div>🔢 <b>1 - 8</b> : Ekranlar arası geçiş yap (Sunum için)</div>
</div>"""

content = content.replace(old_badge, new_badge)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully installed custom touch cursor overlay for recording mode!")
