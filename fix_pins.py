import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The existing pin logic is:
#  locations.forEach(loc => {
#    L.marker([loc.lat, loc.lng], {
#      icon: L.divIcon({ html: '<div class="custom-bubble">' + loc.price + '</div>', className: 'map-bubble' })
#    }).addTo(map);
#  });

new_logic = """  locations.forEach(loc => {
    L.marker([loc.lat, loc.lng], {
      icon: L.divIcon({ html: '<div class="custom-bubble">' + loc.price + '</div>', className: 'map-bubble' })
    }).addTo(map);
    
    // Add identical pins to map2
    L.marker([loc.lat, loc.lng], {
      icon: L.divIcon({ html: '<div style="background:#0b5942;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);">' + (Math.floor(Math.random()*20)+1) + '</div>', className: 'tgtg-pin' })
    }).addTo(map2);
  });"""

content = re.sub(r'  locations\.forEach\(loc => \{\n    L\.marker\(\[loc\.lat, loc\.lng\], \{\n      icon: L\.divIcon\(\{ html: \'<div class="custom-bubble">\' \+ loc\.price \+ \'</div>\', className: \'map-bubble\' \}\)\n    \}\)\.addTo\(map\);\n  \}\);', new_logic, content)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
