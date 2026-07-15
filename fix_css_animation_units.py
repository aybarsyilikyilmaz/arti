import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace CSS rules with px units
css_old = """  .loader-circle {
    stroke-dasharray: 251;
    stroke-dashoffset: 251;
    transform: rotate(-90deg);
    transform-origin: 50px 50px;
    transition: stroke-dashoffset 0.1s ease;
  }
  .checkmark-path {
    stroke-dasharray: 50;
    stroke-dashoffset: 50;
  }"""

css_new = """  .loader-circle {
    stroke-dasharray: 251px;
    stroke-dashoffset: 251px;
    transform: rotate(-90deg);
    transform-origin: 50px 50px;
    transition: stroke-dashoffset 0.1s ease;
  }
  .checkmark-path {
    stroke-dasharray: 50px;
    stroke-dashoffset: 50px;
  }"""
content = content.replace(css_old, css_new)

# Also fix the keyframes to have px units
keyframes_old = """  @keyframes loadProgress {
    0% { stroke-dashoffset: 251; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes drawCheck {
    0% { stroke-dashoffset: 50; }
    100% { stroke-dashoffset: 0; }
  }"""

keyframes_new = """  @keyframes loadProgress {
    0% { stroke-dashoffset: 251px; }
    100% { stroke-dashoffset: 0px; }
  }
  @keyframes drawCheck {
    0% { stroke-dashoffset: 50px; }
    100% { stroke-dashoffset: 0px; }
  }"""
content = content.replace(keyframes_old, keyframes_new)

# Fix the checkmark icon at the top of Screen 6 to be solid green with a white check
icon_old = """          <!-- Top Icon -->
          <div style="width: 72px; height: 72px; border-radius: 50%; border: 6px solid #1E8E7D; display: flex; align-items: center; justify-content: center; margin-bottom: 1.2rem;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1E8E7D" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>"""

icon_new = """          <!-- Top Icon -->
          <div style="width: 72px; height: 72px; border-radius: 50%; background: #1E8E7D; display: flex; align-items: center; justify-content: center; margin-bottom: 1.2rem; box-shadow: 0 4px 12px rgba(30,142,125,0.2);">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>"""
content = content.replace(icon_old, icon_new)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
