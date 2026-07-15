with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add CSS rules at the end of the style block
old_style_end = """  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>"""

new_style_end = """  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Recording Mode styles */
  body.recording-mode {
    background: #ffffff !important;
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  body.recording-mode .stage-header,
  body.recording-mode .controls,
  body.recording-mode #screen-label,
  body.recording-mode .device-wrap::before,
  body.recording-mode .device-wrap::after {
    display: none !important;
  }
  body.recording-mode .device-wrap {
    margin: 0 !important;
    padding: 0 !important;
  }
  body.recording-mode .phone {
    width: 375px !important;
    height: 812px !important;
    aspect-ratio: auto !important;
    border-radius: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
  }
  body.recording-mode .app-viewport {
    border-radius: 0 !important;
  }
  body.recording-mode .notch,
  body.recording-mode .home-indicator {
    display: none !important;
  }
  
  /* Floating Helper Badge */
  .recording-tip {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: 0.6rem 1.1rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    z-index: 99999;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    pointer-events: none;
    transition: opacity 0.3s ease;
    font-family: inherit;
  }
  body.recording-mode .recording-tip {
    opacity: 0;
  }
</style>"""

content = content.replace(old_style_end, new_style_end)

# 2. Add floating helper badge to the HTML
old_html_nav = """  <div class="controls">
    <button class="nav-btn" onclick="step(-1)" aria-label="Önceki ekran">‹</button>
    <div class="dots" id='dots'></div>
    <button class="nav-btn" onclick="step(1)" aria-label="Sonraki ekran">›</button>
  </div>
  <p class="screen-label" id='screen-label'></p>
</div>"""

new_html_nav = """  <div class="controls">
    <button class="nav-btn" onclick="step(-1)" aria-label="Önceki ekran">‹</button>
    <div class="dots" id='dots'></div>
    <button class="nav-btn" onclick="step(1)" aria-label="Sonraki ekran">›</button>
  </div>
  <p class="screen-label" id='screen-label'></p>
</div>

<!-- Floating helper badge for recording -->
<div class="recording-tip">
  <span>📹 Kayıt Modu: Çerçeveyi gizlemek/dikdörtgen yapmak için klavyeden <b>K</b> tuşuna basın.</span>
</div>"""

content = content.replace(old_html_nav, new_html_nav)

# 3. Add JS event listener to toggle recording-mode on keypress 'k'
old_js_end = """    });
  })();
</script>"""

new_js_end = """    });
  })();

  // Toggle Recording Mode via 'k' key
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
  });
</script>"""

content = content.replace(old_js_end, new_js_end)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully integrated clean recording mode!")
