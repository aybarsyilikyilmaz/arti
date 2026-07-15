import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Modify .screen in CSS to use visibility: hidden
screen_css_search = r"""  \.screen \{
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    opacity: 0;
    transform: scale\(0.97\);
    pointer-events: none;
    transition: opacity 0.32s ease, transform 0.32s ease;
  \}"""

screen_css_replace = """  .screen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    opacity: 0;
    visibility: hidden;
    transform: scale(0.97);
    pointer-events: none;
    transition: opacity 0.32s ease, transform 0.32s ease, visibility 0.32s;
  }"""

content = re.sub(screen_css_search, screen_css_replace, content)

# Modify .screen.active in CSS to use visibility: visible
active_css_search = r"""  \.screen\.active \{
    opacity: 1;
    transform: scale\(1\);
    pointer-events: auto;
    z-index: 2;
  \}"""

active_css_replace = """  .screen.active {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
    pointer-events: auto;
    z-index: 2;
  }"""

content = re.sub(active_css_search, active_css_replace, content)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
