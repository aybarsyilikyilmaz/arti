import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the HTML code display to not have the label
old_html = '<p id="pickup-code-display" style="margin: 0 0 1.5rem; font-size: 1.15rem; font-weight: 800; color: #1E8E7D; text-align: center; letter-spacing: 2px;">TESLİM ALMA KODU: 849204</p>'
new_html = '<p id="pickup-code-display" style="margin: 0 0 1.5rem; font-size: 1.4rem; font-weight: 800; color: #1E8E7D; text-align: center; letter-spacing: 4px;">849204</p>'
content = content.replace(old_html, new_html)

# Update the JS to set the textContent to just the randomCode
old_js = "document.getElementById('pickup-code-display').textContent = 'TESLİM ALMA KODU: ' + randomCode;"
new_js = "document.getElementById('pickup-code-display').textContent = randomCode;"
content = content.replace(old_js, new_js)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
