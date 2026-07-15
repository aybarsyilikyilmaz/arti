import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the top icon style on screen 6 to add flex-shrink: 0
old_icon = """          <!-- Top Icon -->
          <div style="width: 72px; height: 72px; border-radius: 50%; background: #1E8E7D; display: flex; align-items: center; justify-content: center; margin-bottom: 1.2rem; box-shadow: 0 4px 12px rgba(30,142,125,0.2);">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>"""

new_icon = """          <!-- Top Icon -->
          <div style="width: 72px; height: 72px; border-radius: 50%; background: #1E8E7D; display: flex; align-items: center; justify-content: center; margin-bottom: 1.2rem; box-shadow: 0 4px 12px rgba(30,142,125,0.2); flex-shrink: 0;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>"""

content = content.replace(old_icon, new_icon)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
