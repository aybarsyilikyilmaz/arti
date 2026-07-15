with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the List View toggle button on Screen 2 to goTo(3)
old_btn = 'onclick="goTo(4)" class="tgtg-icon-btn" style="background: #fff; border: none; border-radius: 8px; width: 2.8rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" title="Liste Görünümü"'
new_btn = 'onclick="goTo(3)" class="tgtg-icon-btn" style="background: #fff; border: none; border-radius: 8px; width: 2.8rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" title="Liste Görünümü"'
content = content.replace(old_btn, new_btn)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
