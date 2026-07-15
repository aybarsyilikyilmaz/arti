import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove transition from .loader-circle to prevent conflicts with keyframe animation
css_old = """  .loader-circle {
    stroke-dasharray: 251px;
    stroke-dashoffset: 251px;
    transform: rotate(-90deg);
    transform-origin: 50px 50px;
    transition: stroke-dashoffset 0.1s ease;
  }"""

css_new = """  .loader-circle {
    stroke-dasharray: 251px;
    stroke-dashoffset: 251px;
    transform: rotate(-90deg);
    transform-origin: 50px 50px;
  }"""
content = content.replace(css_old, css_new)

# Update HTML to define stroke color on checkmark path directly
html_old = '<path class="checkmark-path" d="M35 50 l10 10 l20 -20" stroke="transparent" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" />'
html_new = '<path class="checkmark-path" d="M35 50 l10 10 l20 -20" stroke="#388E3C" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" />'
content = content.replace(html_old, html_new)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
