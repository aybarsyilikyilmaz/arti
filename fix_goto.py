import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a slight delay to goTo for a better tactile feel
js_search = r"""  function goTo\(index\) \{
    screens\[current\]\.classList\.remove\('active'\);
    current = \(index \+ screens\.length\) % screens\.length;
    screens\[current\]\.classList\.add\('active'\);"""

js_replace = """  function goTo(index) {
    // Slight delay so the button press animation can be felt before the screen changes
    setTimeout(() => {
      screens[current].classList.remove('active');
      current = (index + screens.length) % screens.length;
      screens[current].classList.add('active');
      [...dotsWrap.children].forEach((d, i) => d.classList.toggle('on', i === current));
      label.textContent = (current + 1) + ' / ' + screens.length + ' — ' + labels[current];
      
      if (index === 1 && typeof map !== 'undefined') {
        setTimeout(() => map.invalidateSize(), 100);
      }
    }, 150);
  }"""

# Need to replace the whole goTo function to avoid duplicating the label and map parts
content = re.sub(r'  function goTo\(index\) \{.*?    \}\n  \}', js_replace, content, flags=re.DOTALL)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
