with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# --- Section 1: Add Sushi Star after Manolya Cafe ---
sushi_card = """
              <!-- Card 3: Sushi Star -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('sushi_platter.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Hızla tükeniyor</div>
                  <div style="position: absolute; top: 8px; right: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; display: flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">★ 4.6</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #000; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">S</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Sushi Star - Moda</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Premium Sushi Sürpriz Kutu</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Bugün 21:00 - 22:30</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>950 m</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">600 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">300 ₺</span>
                  </div>
                </div>
              </div>"""

content = content.replace("<!-- Card 2: Manolya Cafe -->", "<!-- Card 2: Manolya Cafe -->")
# Let's locate the specific block for Manolya Cafe end
manolya_block = """              <!-- Card 2: Manolya Cafe -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('manolya.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">2 adet kaldı</div>
                  <div style="position: absolute; top: 8px; right: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; display: flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">★ 4.8</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #d32f2f; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">M</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Manolya Cafe</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Sürpriz Kutu (Vejetaryen)</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Bugün 18:00 - 18:30</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>450 m</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">500 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">250 ₺</span>
                  </div>
                </div>
              </div>"""

content = content.replace(manolya_block, manolya_block + sushi_card)

# --- Section 2: Add Defne Kahve after Papatya Fırın ---
defne_card = """
              <!-- Card 3: Defne Kahve -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column; height: 210px;" onclick="goTo(4)">
                <div style="position: relative; height: 110px; background-image: url('defne.jpg'); background-size: cover; background-position: center;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Popüler</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #004d40; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">D</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.1rem; flex: 1; justify-content: space-between;">
                  <div>
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111;">Defne Kahve</h4>
                    <span style="font-size: 0.75rem; color: #666;">Kahve & Tatlı Kutusu</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.1rem;">
                    <span style="font-size: 0.75rem; color: #777;">650m &bull; Bugün 19:00</span>
                    <div style="display: flex; gap: 0.3rem; align-items: center;">
                      <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">350 ₺</span>
                      <span style="font-size: 0.9rem; font-weight: 800; color: #006256;">175 ₺</span>
                    </div>
                  </div>
                </div>
              </div>"""

papatya_block = """              <!-- Card 2: Papatya Fırın -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column; height: 210px;" onclick="goTo(4)">
                <div style="position: relative; height: 110px; background-image: url('papatya.jpg'); background-size: cover; background-position: center;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Çok beğenilen</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #ffb300; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">P</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.1rem; flex: 1; justify-content: space-between;">
                  <div>
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111;">Papatya Fırın</h4>
                    <span style="font-size: 0.75rem; color: #666;">Fırın Sürpriz Kutusu</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.1rem;">
                    <span style="font-size: 0.75rem; color: #777;">700m &bull; Bugün 17:00</span>
                    <div style="display: flex; gap: 0.3rem; align-items: center;">
                      <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">400 ₺</span>
                      <span style="font-size: 0.9rem; font-weight: 800; color: #006256;">200 ₺</span>
                    </div>
                  </div>
                </div>
              </div>"""

content = content.replace(papatya_block, papatya_block + defne_card)

# --- Section 3: Add Burger Box after Circle K ---
burger_card = """
              <!-- Card 2: Burger Box -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('gourmet_burger.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #d32f2f; color: #fff; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">1 adet kaldı</div>
                  <div style="position: absolute; top: 8px; right: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; display: flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">★ 4.5</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #d84315; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">B</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Burger Box - Kadıköy</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Double Burger & Patates Kutusu</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Bugün 22:00 - 23:30</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>1.1 km</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">500 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">250 ₺</span>
                  </div>
                </div>
              </div>"""

circlek_block = """              <!-- Card 1: Circle K -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('pastries_sandwiches.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #d32f2f; color: #fff; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">2 adet kaldı</div>
                  <div style="position: absolute; top: 8px; right: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; display: flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">★ 4.5</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #e65100; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">C</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Circle K - Bahariye</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Tatlı & Tuzlu Sürpriz Kutu</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Bugün 20:00 - 22:00</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>788 m</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">450 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">200 ₺</span>
                  </div>
                </div>
              </div>"""

content = content.replace(circlek_block, circlek_block + burger_card)

# --- Section 4: Add Antepli Tatlıcı after Organik Manav ---
baklava_card = """
              <!-- Card 2: Antepli Tatlıcı -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('turkish_baklava.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #006256; color: #fff; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Yeni</div>
                  <div style="position: absolute; top: 8px; right: 8px; background: #fff; color: #111; font-weight: 800; font-size: 0.7rem; padding: 3px 8px; border-radius: 999px; display: flex; align-items: center; gap: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">★ 4.9</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #2e7d32; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">A</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Antepli Tatlıcı</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Fıstıklı Baklava & Şöbiyet Kutusu</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Bugün 20:00 - 22:00</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>1.5 km</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">400 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">200 ₺</span>
                  </div>
                </div>
              </div>"""

manav_block = """              <!-- Card 1: Organik Manav -->
              <div style="flex: 0 0 250px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; cursor: pointer; display: flex; flex-direction: column;" onclick="goTo(4)">
                <div style="position: relative; height: 125px; background-image: url('fresh_groceries.jpg'); background-size: cover; background-position: center; border-radius: 16px 16px 0 0;">
                  <div style="position: absolute; top: 8px; left: 8px; background: #006256; color: #fff; font-weight: 800; font-size: 0.75rem; padding: 4px 10px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">Yeni</div>
                  <div style="position: absolute; bottom: -14px; left: 12px; width: 28px; height: 28px; border-radius: 50%; background: #2e7d32; border: 2.5px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; font-size: 0.7rem; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">O</div>
                </div>
                <div style="padding: 1.1rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">Organik Manav - Moda</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <span style="font-size: 0.8rem; color: #666;">Sebze & Meyve Kutusu</span>
                  <div style="font-size: 0.75rem; color: #777; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.1rem;">
                    <span>Yarın 10:00 - 12:00</span>
                    <span style="color: #ccc;">&bull;</span>
                    <span>1.2 km</span>
                  </div>
                  <div style="display: flex; justify-content: flex-end; align-items: center; gap: 0.3rem; border-top: 1px dashed #f0f0f0; padding-top: 0.5rem;">
                    <span style="font-size: 0.75rem; text-decoration: line-through; color: #888;">300 ₺</span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #006256;">150 ₺</span>
                  </div>
                </div>
              </div>"""

content = content.replace(manav_block, manav_block + baklava_card)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
