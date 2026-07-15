with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix checkout back button (Screen 5 -> Screen 4)
# Look at line 1049:
old_checkout_back = '<button class="icon-btn" onclick="goTo(5)" style="width: 32px; height: 32px;'
new_checkout_back = '<button class="icon-btn" onclick="goTo(4)" style="width: 32px; height: 32px;'
content = content.replace(old_checkout_back, new_checkout_back)

# 2. Fix detail back button (Screen 4 -> Screen 3)
# Let's search for detail screen back button, it was line 999:
old_detail_back = '<button class="icon-btn" onclick="goTo(4)">←</button>'
new_detail_back = '<button class="icon-btn" onclick="goTo(3)">←</button>'
content = content.replace(old_detail_back, new_detail_back)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
