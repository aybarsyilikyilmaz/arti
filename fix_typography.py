import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Card 1
card1_search = r"""              <!-- Card 1 -->
              <div class="tgtg-card" style="width: 100%; cursor: pointer;" onclick="goTo\(3\)">
                <div class="tgtg-img-wrap" style="position: relative; height: 11rem; border-radius: 12px; overflow: hidden; margin-bottom: 0\.8rem; background-image: url\('manolya\.jpg'\); background-size: cover; background-position: center;">
                  <div style="position: absolute; top: 0\.6rem; left: 0\.6rem; background: #ffdfba; color: #000; font-weight: 800; font-size: 0\.75rem; padding: 0\.3rem 0\.6rem; border-radius: 999px;">2 kutu kaldı</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h4 style="margin: 0 0 0\.2rem; font-size: 1\.1rem; font-weight: 800; color: #000;">Manolya Cafe</h4>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b5942" stroke-width="2"><path d="M20\.84 4\.61a5\.5 5\.5 0 0 0-7\.78 0L12 5\.67l-1\.06-1\.06a5\.5 5\.5 0 0 0-7\.78 7\.78l1\.06 1\.06L12 21\.23l7\.78-7\.78 1\.06-1\.06a5\.5 5\.5 0 0 0 0-7\.78z"/></svg>
                </div>
                <p style="margin: 0 0 0\.3rem; font-size: 0\.9rem; color: #555;">Salata & Sağlıklı Kaseler</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 0\.8rem; color: #555;">
                  <div>
                    <span>Bugün alın 18:00 - 19:30</span><br>
                    <span>450 m</span>
                  </div>
                  <div style="text-align: right;">
                    <span style="text-decoration: line-through; color: #888; font-size: 0\.8rem; margin-right: 0\.4rem;">500 ₺</span>
                    <span style="color: #0b5942; font-weight: 800; font-size: 1\.1rem;">250 ₺</span>
                  </div>
                </div>
              </div>"""

card1_replace = """              <!-- Card 1 -->
              <div class="tgtg-card" style="width: 100%; cursor: pointer;" onclick="goTo(3)">
                <div class="tgtg-img-wrap" style="position: relative; height: 12rem; border-radius: 12px; overflow: hidden; margin-bottom: 0.8rem; background-image: url('manolya.jpg'); background-size: cover; background-position: center;">
                  <div style="position: absolute; top: 0.8rem; left: 0.8rem; background: #F2C94C; color: #000; font-weight: 700; font-size: 0.8rem; padding: 0.3rem 0.6rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.15); letter-spacing: -0.2px;">2 adet kaldı</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.1rem;">
                  <h4 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #222; letter-spacing: -0.4px;">Manolya Cafe</h4>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <p style="margin: 0 0 0.4rem; font-size: 0.95rem; color: #666; font-weight: 500; letter-spacing: -0.2px;">Salata & Sağlıklı Kaseler</p>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #777;">
                  <div style="font-weight: 500; letter-spacing: -0.2px;">
                    Bugün alın 18:00 - 19:30 • 450 m
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span style="text-decoration: line-through; color: #999; font-size: 0.9rem; font-weight: 500;">500 ₺</span>
                    <span style="color: #006256; font-weight: 800; font-size: 1.3rem; letter-spacing: -0.5px;">250 ₺</span>
                  </div>
                </div>
              </div>"""
content = re.sub(card1_search, card1_replace, content)

# Fix Card 2
card2_search = r"""              <!-- Card 2 -->
              <div class="tgtg-card" style="width: 100%; cursor: pointer;" onclick="goTo\(3\)">
                <div class="tgtg-img-wrap" style="position: relative; height: 11rem; border-radius: 12px; overflow: hidden; margin-bottom: 0\.8rem; background-image: url\('papatya\.jpg'\); background-size: cover; background-position: center;">
                  <div style="position: absolute; top: 0\.6rem; left: 0\.6rem; background: #ffdfba; color: #000; font-weight: 800; font-size: 0\.75rem; padding: 0\.3rem 0\.6rem; border-radius: 999px;">5 kutu kaldı</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h4 style="margin: 0 0 0\.2rem; font-size: 1\.1rem; font-weight: 800; color: #000;">Papatya Fırın</h4>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b5942" stroke-width="2"><path d="M20\.84 4\.61a5\.5 5\.5 0 0 0-7\.78 0L12 5\.67l-1\.06-1\.06a5\.5 5\.5 0 0 0-7\.78 7\.78l1\.06 1\.06L12 21\.23l7\.78-7\.78 1\.06-1\.06a5\.5 5\.5 0 0 0 0-7\.78z"/></svg>
                </div>
                <p style="margin: 0 0 0\.3rem; font-size: 0\.9rem; color: #555;">Fırın Sürpriz Kutusu</p>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 0\.8rem; color: #555;">
                  <div>
                    <span>Bugün alın 17:00 - 18:00</span><br>
                    <span>700 m</span>
                  </div>
                  <div style="text-align: right;">
                    <span style="text-decoration: line-through; color: #888; font-size: 0\.8rem; margin-right: 0\.4rem;">450 ₺</span>
                    <span style="color: #0b5942; font-weight: 800; font-size: 1\.1rem;">200 ₺</span>
                  </div>
                </div>
              </div>"""

card2_replace = """              <!-- Card 2 -->
              <div class="tgtg-card" style="width: 100%; cursor: pointer;" onclick="goTo(3)">
                <div class="tgtg-img-wrap" style="position: relative; height: 12rem; border-radius: 12px; overflow: hidden; margin-bottom: 0.8rem; background-image: url('papatya.jpg'); background-size: cover; background-position: center;">
                  <div style="position: absolute; top: 0.8rem; left: 0.8rem; background: #F2C94C; color: #000; font-weight: 700; font-size: 0.8rem; padding: 0.3rem 0.6rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.15); letter-spacing: -0.2px;">5 adet kaldı</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.1rem;">
                  <h4 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #222; letter-spacing: -0.4px;">Papatya Fırın</h4>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <p style="margin: 0 0 0.4rem; font-size: 0.95rem; color: #666; font-weight: 500; letter-spacing: -0.2px;">Fırın Sürpriz Kutusu</p>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #777;">
                  <div style="font-weight: 500; letter-spacing: -0.2px;">
                    Bugün alın 17:00 - 18:00 • 700 m
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span style="text-decoration: line-through; color: #999; font-size: 0.9rem; font-weight: 500;">450 ₺</span>
                    <span style="color: #006256; font-weight: 800; font-size: 1.3rem; letter-spacing: -0.5px;">200 ₺</span>
                  </div>
                </div>
              </div>"""

content = re.sub(card2_search, card2_replace, content)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
