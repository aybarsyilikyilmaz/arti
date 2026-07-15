import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix translations
content = content.replace('placeholder="Search"', 'placeholder="Ara"')
content = content.replace('9 Surprise Bags', 'Yakınınızda 9 Sürpriz Kutu')
content = content.replace('2 left', '2 kutu kaldı')
content = content.replace('5 left', '5 kutu kaldı')
content = content.replace('Salads & Healthy Bowls', 'Salata & Sağlıklı Kaseler')
content = content.replace('Bakery Surprise Bag', 'Fırın Sürpriz Kutusu')
content = content.replace('Pick up today', 'Bugün alın')

# Add prices to Card 1
card1_search = r"""<div style="display: flex; justify-content: space-between; font-size: 0\.8rem; color: #555;">
                  <span>Bugün alın 18:00 - 19:30</span>
                  <span>450 m</span>
                </div>"""
card1_replace = """<div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 0.8rem; color: #555;">
                  <div>
                    <span>Bugün alın 18:00 - 19:30</span><br>
                    <span>450 m</span>
                  </div>
                  <div style="text-align: right;">
                    <span style="text-decoration: line-through; color: #888; font-size: 0.8rem; margin-right: 0.4rem;">500 ₺</span>
                    <span style="color: #0b5942; font-weight: 800; font-size: 1.1rem;">250 ₺</span>
                  </div>
                </div>"""
content = re.sub(card1_search, card1_replace, content)

# Add prices to Card 2
card2_search = r"""<div style="display: flex; justify-content: space-between; font-size: 0\.8rem; color: #555;">
                  <span>Bugün alın 17:00 - 18:00</span>
                  <span>700 m</span>
                </div>"""
card2_replace = """<div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 0.8rem; color: #555;">
                  <div>
                    <span>Bugün alın 17:00 - 18:00</span><br>
                    <span>700 m</span>
                  </div>
                  <div style="text-align: right;">
                    <span style="text-decoration: line-through; color: #888; font-size: 0.8rem; margin-right: 0.4rem;">450 ₺</span>
                    <span style="color: #0b5942; font-weight: 800; font-size: 1.1rem;">200 ₺</span>
                  </div>
                </div>"""
content = re.sub(card2_search, card2_replace, content)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
