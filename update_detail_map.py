with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the old vector mock map block
old_map_block = """            <div class="mini-map">
              <svg viewBox="0 0 300 100" preserveAspectRatio="none">
                <path d='M0 30 Q100 5 150 35 T300 20' stroke="#a9c2b5" stroke-width="6" fill='none'/>
                <path d='M60 0 L70 100' stroke="#c3d6cb" stroke-width="4"/>
              </svg>
              <div class="map-pin" style="top:45%;left:48%;font-size:1.1rem;">📍</div>
            </div>"""

# Define the new real map block
new_map_block = """            <div class="mini-map" style="background-image: url('kadikoy_map_static.jpg'); background-size: cover; background-position: center; height: 6.5rem; position: relative; border-radius: 0.8rem; border: 1px solid #e0e0e0; margin-top: 0.6rem;">
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); font-size: 1.6rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">📍</div>
            </div>"""

content = content.replace(old_map_block, new_map_block)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated detail screen map to real map!")
