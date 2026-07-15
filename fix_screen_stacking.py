with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Update .screen and .screen.active stacking context properties
old_css = """  .screen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    opacity: 0;
    visibility: hidden;
    transform: scale(0.97);
    pointer-events: none;
    transition: opacity 0.32s ease, transform 0.32s ease, visibility 0.32s;
  }
  .screen.active {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
    pointer-events: auto;
    z-index: 2;
  }"""

new_css = """  .screen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    opacity: 0;
    visibility: hidden;
    transform: scale(0.97);
    pointer-events: none;
    transition: opacity 0.32s ease, transform 0.32s ease, visibility 0.32s;
    z-index: 1; /* Establish local stacking context for all screens */
  }
  .screen.active {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
    pointer-events: auto;
    z-index: 10; /* Force active screen to stack on top of everything */
  }"""

content = content.replace(old_css, new_css)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
