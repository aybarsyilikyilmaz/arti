with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Revert normal mode .phone css block
old_phone_style = """  .phone {
    position: relative;
    width: 288px; /* Matched exactly to the landing page mockup width (w-72 = 288px) */
    height: 560px; /* Matched exactly to the landing page mockup height (560px) */
    background: #0b0f0d;
    border-radius: 2.2rem;
    padding: 0.55rem;
    box-shadow:
      0 30px 60px -20px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  }"""

new_phone_style = """  .phone {
    position: relative;
    width: min(340px, 86vw);
    aspect-ratio: 9 / 19.5;
    background: #0b0f0d;
    border-radius: 3rem;
    padding: 0.55rem;
    box-shadow:
      0 30px 60px -20px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  }"""

content = content.replace(old_phone_style, new_phone_style)

# 2. Revert normal mode .app-viewport border-radius
old_viewport_style = """  .app-viewport {
    position: relative;
    width: 100%;
    height: 100%;
    background: var(--app-bg);
    border-radius: 1.8rem;
    overflow: hidden;
    color: var(--app-text);
  }"""

new_viewport_style = """  .app-viewport {
    position: relative;
    width: 100%;
    height: 100%;
    background: var(--app-bg);
    border-radius: 2.5rem;
    overflow: hidden;
    color: var(--app-text);
  }"""

content = content.replace(old_viewport_style, new_viewport_style)

# 3. Revert recording mode .phone css block
old_rec_phone_style = """  body.recording-mode .phone {
    width: calc(288px - 1.1rem) !important;
    height: calc(560px - 1.1rem) !important;
    aspect-ratio: auto !important;
    border-radius: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
  }"""

new_rec_phone_style = """  body.recording-mode .phone {
    width: calc(min(340px, 86vw) - 1.1rem) !important;
    height: calc((min(340px, 86vw) * 19.5 / 9) - 1.1rem) !important;
    aspect-ratio: auto !important;
    border-radius: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
  }"""

content = content.replace(old_rec_phone_style, new_rec_phone_style)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully reverted prototype phone dimensions back to original responsive sizes!")
