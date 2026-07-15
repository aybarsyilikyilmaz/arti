with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Globally change all onclick="goTo(5)" to onclick="goTo(4)"
# This will fix all cafe cards and checkout back buttons.
content = content.replace('onclick="goTo(5)"', 'onclick="goTo(4)"')

# 2. Restore the specific "Rezerve et" button to goTo(5)
content = content.replace('class="pill-btn" style="flex:1;" onclick="goTo(4)"', 'class="pill-btn" style="flex:1;" onclick="goTo(5)"')

# 3. Restore the List View toggle button on Screen 2 to goTo(3)
content = content.replace('class="tgtg-icon-btn" style="background: #fff; border: none; border-radius: 8px; width: 2.8rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" title="Liste Görünümü" onclick="goTo(4)"',
                          'class="tgtg-icon-btn" style="background: #fff; border: none; border-radius: 8px; width: 2.8rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" title="Liste Görünümü" onclick="goTo(3)"')

# 4. Double check checkout back button to make sure it is goTo(4)
# (It was goTo(5) in the file, so step 1 turned it into goTo(4), which is correct!)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
