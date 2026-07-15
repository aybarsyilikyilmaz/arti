import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the code block from the bottom of the card
old_bottom_block = """            <div style="margin-top: 1.5rem; text-align: center; border-top: 1px dashed #eee; padding-top: 1.2rem;">
              <p id="pickup-code-display" style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #1E8E7D; letter-spacing: 2px;">TESLİM ALMA KODU: 849204</p>
            </div>"""

content = content.replace(old_bottom_block, "")

# 2. Insert it back right below the QR canvas wrapper, keeping 6-digit style
qr_wrapper = """            <div style="display: flex; justify-content: center; margin-bottom: 1.5rem;">
              <canvas id="qr-canvas" width="160" height="160" style="border: 4px solid #fff; outline: 1px solid #eee; padding: 4px; box-sizing: border-box;"></canvas>
            </div>"""

new_qr_wrapper = """            <div style="display: flex; justify-content: center; margin-bottom: 1.5rem;">
              <canvas id="qr-canvas" width="160" height="160" style="border: 4px solid #fff; outline: 1px solid #eee; padding: 4px; box-sizing: border-box;"></canvas>
            </div>
            
            <p id="pickup-code-display" style="margin: 0 0 1.5rem; font-size: 1.15rem; font-weight: 800; color: #1E8E7D; text-align: center; letter-spacing: 2px;">TESLİM ALMA KODU: 849204</p>"""

content = content.replace(qr_wrapper, new_qr_wrapper)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
