import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the logo badges from Card 1 and Card 2
# The HTML looks like this:
# <div style="position: absolute; bottom: 0.6rem; left: 0.6rem; width: 2.2rem; height: 2.2rem; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">🥗</div>
# and
# <div style="position: absolute; bottom: 0.6rem; left: 0.6rem; width: 2.2rem; height: 2.2rem; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">🥐</div>

content = re.sub(r'<div style="position: absolute; bottom: 0\.6rem; left: 0\.6rem; width: 2\.2rem; height: 2\.2rem; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; box-shadow: 0 2px 5px rgba\(0,0,0,0\.2\);">[^<]+</div>', '', content)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
