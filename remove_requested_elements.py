import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the "Yerel Kahramanlar" promo banner card completely
banner_pattern = r'<!-- Card 1: Meet our Local Heroes banner -->\s*<div style="flex: 0 0 250px; background: linear-gradient\(135deg, #e0f2f1 0%, #b2dfdb 100%\); border-radius: 16px; padding: 1\.2rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba\(0,0,0,0\.03\); border: 1px solid #c2e8e4; height: 210px; box-sizing: border-box;">.*?</div>'
content = re.sub(banner_pattern, '', content, flags=re.DOTALL)

# 2. Remove all circle brand logo overlaps from the cards
# Match: <div style="position: absolute; bottom: -14px; left: 12px; ...">X</div>
circle_pattern = r'<div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #[a-zA-Z0-9]{3,6}; border: 2\.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0\.7rem; box-shadow: 0 2px 6px rgba\(0,0,0,0\.1\);">[A-Z]</div>'
content = re.sub(circle_pattern, '', content)

# 3. Adjust the padding-top of the text details container (since overlap is removed)
# Change padding: 1.1rem 0.8rem 0.8rem to padding: 0.8rem
content = content.replace('padding: 1.1rem 0.8rem 0.8rem;', 'padding: 0.8rem;')

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
