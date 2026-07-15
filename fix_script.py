import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix goTo function
goto_search = r"""  function goTo\(index\) \{
    screens\[current\]\.classList\.remove\('active'\);
    current = \(index \+ screens\.length\) % screens\.length;
    screens\[current\]\.classList\.add\('active'\);
    \[\.\.\.dotsWrap\.children\]\.forEach\(\(d, i\) => d\.classList\.toggle\('on', i === current\)\);
    label\.textContent = \(current \+ 1\) \+ ' / ' \+ screens\.length \+ ' — ' \+ labels\[current\];
  \}"""

goto_replace = """  function goTo(index) {
    setTimeout(() => {
      screens[current].classList.remove('active');
      current = (index + screens.length) % screens.length;
      screens[current].classList.add('active');
      [...dotsWrap.children].forEach((d, i) => d.classList.toggle('on', i === current));
      label.textContent = (current + 1) + ' / ' + screens.length + ' — ' + labels[current];
      
      if (typeof map !== 'undefined') {
        setTimeout(() => map.invalidateSize(), 100);
      }
      if (typeof map2 !== 'undefined') {
        setTimeout(() => {
          map2.invalidateSize();
          map2.setView(map.getCenter(), map.getZoom(), { animate: false });
        }, 100);
      }
    }, 150);
  }"""

content = re.sub(goto_search, goto_replace, content)

# Map 2 initialization
map_search = r"""  // Initialize Real Map
  const map = L\.map\('map-container', \{
    zoomControl: false,
    attributionControl: false,
    zoomSnap: 0 // Allow buttery smooth fractional zooming
  \}\)\.setView\(\[40\.988, 29\.028\], 14\); // Kadıköy Boğa Heykeli Merkezi

  // Vibrant map style \(Google Maps standard tiles for that exact familiar look\)
  L\.tileLayer\('http://mt1\.google\.com/vt/lyrs=m&x=\{x\}&y=\{y\}&z=\{z\}', \{
    maxZoom: 19
  \}\)\.addTo\(map\);"""

map_replace = """  // Initialize Real Map
  const map = L.map('map-container', {
    zoomControl: false,
    attributionControl: false,
    zoomSnap: 0 // Allow buttery smooth fractional zooming
  }).setView([40.988, 29.028], 14); // Kadıköy Boğa Heykeli Merkezi

  // Second map
  const map2 = L.map('map-container-2', {
    zoomControl: false,
    attributionControl: false,
    zoomSnap: 0 
  }).setView([40.988, 29.028], 14);

  // Vibrant map style (Google Maps standard tiles for that exact familiar look)
  L.tileLayer('http://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 19
  }).addTo(map);

  L.tileLayer('http://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 19
  }).addTo(map2);"""

content = re.sub(map_search, map_replace, content)

# Map 2 Pins
pin_search = r"""  locations\.forEach\(loc => \{
    const icon = L\.divIcon\(\{
      className: 'custom-bubble',
      html: `<div>\$\{loc\[2\]\}</div>`,
      iconSize: \[30, 30\]
    \}\);
    L\.marker\(\[loc\[0\], loc\[1\]\], \{icon\}\)\.addTo\(map\);
  \}\);"""

pin_replace = """  locations.forEach(loc => {
    const icon = L.divIcon({
      className: 'custom-bubble',
      html: `<div>${loc[2]}</div>`,
      iconSize: [30, 30]
    });
    L.marker([loc[0], loc[1]], {icon}).addTo(map);
    
    // TGTG Style icons for map2
    const icon2 = L.divIcon({
      className: '',
      html: `<div style="background:#0b5942;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:11px;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);">${loc[2]}</div>`,
      iconSize: [24, 24]
    });
    L.marker([loc[0], loc[1]], {icon: icon2}).addTo(map2);
  });"""

content = re.sub(pin_search, pin_replace, content)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
