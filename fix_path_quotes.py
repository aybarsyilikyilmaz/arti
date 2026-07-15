import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace double quotes on SVG path attributes
content = re.sub(r'd="([^"]+)"', r"d='\1'", content)
# Also fix any other SVG tag inside style
content = re.sub(r'fill="([^"]+)"', r"fill='\1'", content)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
