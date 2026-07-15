import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix header row padding
header_search = r"""        <div class="header-row">
          <button class="icon-btn" onclick="goTo\(2\)">←</button>
          <h2>Mağaza detayları</h2>
          <button class="icon-btn">⤴</button>
        </div>"""
header_replace = """        <div class="header-row" style="padding-top: 3.5rem; padding-bottom: 1rem;">
          <button class="icon-btn" onclick="goTo(2)">←</button>
          <h2>Mağaza detayları</h2>
          <button class="icon-btn">⤴</button>
        </div>"""
content = re.sub(header_search, header_replace, content)

# Fix detail banner to use the image
banner_search = r"""<div class="detail-banner venue-art veg" style="font-size:2\.6rem;">🥗🥙🥕</div>"""
banner_replace = """<div class="detail-banner" style="background-image: url('manolya.jpg'); background-size: cover; background-position: center; height: 16rem; border-radius: 0 0 16px 16px;"></div>"""
content = re.sub(banner_search, banner_replace, content)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
