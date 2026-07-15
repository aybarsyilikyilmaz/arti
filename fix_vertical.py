import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the CSS of the bottom sheet to be vertical and scrollable
html_search = r"""          <div class="tgtg-sheet".*?<div class="tgtg-scroll".*?>"""

# We'll replace the inline styles of tgtg-sheet and tgtg-scroll
html_replace = """          <div class="tgtg-sheet" style="margin-top: 45%; position: relative; z-index: 3; background: #fff; border-radius: 1.2rem 1.2rem 0 0; box-shadow: 0 -4px 15px rgba(0,0,0,0.05); padding: 1rem 0 0; display: flex; flex-direction: column; flex: 1; min-height: 0;">
            <div class="grabber" style="width: 2.5rem; height: 3px; background: #ddd; border-radius: 3px; margin: 0 auto 1rem; flex: none;"></div>
            <h3 style="text-align: center; font-size: 1.05rem; font-weight: 800; margin: 0 0 1rem; color: #000; flex: none;">9 Surprise Bags</h3>
            
            <div class="tgtg-scroll" style="display: flex; flex-direction: column; gap: 1.5rem; padding: 0 1rem 1rem; overflow-y: auto;">"""

content = re.sub(html_search, html_replace, content, flags=re.DOTALL)

# Fix the card width
content = re.sub(r'class="tgtg-card" style="flex: 0 0 85%;', 'class="tgtg-card" style="width: 100%;', content)

# Sync map to map2 in goTo and fix invalidateSize
js_search = r"""if \(index === 1 && typeof map2 !== 'undefined'\) \{
        setTimeout\(\(\) => map2\.invalidateSize\(\), 100\);
      \}"""

js_replace = """if (typeof map !== 'undefined') {
        setTimeout(() => map.invalidateSize(), 100);
      }
      if (typeof map2 !== 'undefined') {
        setTimeout(() => {
          map2.invalidateSize();
          // Sync map2 with map1 (center and zoom)
          map2.setView(map.getCenter(), map.getZoom(), { animate: false });
        }, 100);
      }"""

content = re.sub(js_search, js_replace, content)

# Fix the targetZoom calculation logic so it triggers an update right now
# We can also add an initial invalidateSize in case the map starts grey
content = content.replace("tileLayer2.addTo(map2);", "tileLayer2.addTo(map2);\n    setTimeout(() => map2.invalidateSize(), 500);")

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
