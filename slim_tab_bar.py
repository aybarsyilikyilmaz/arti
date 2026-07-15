with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the old tab-bar css block
old_tab_bar_css = """  .tab-bar {
    flex: none;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 0.55rem 0.5rem 1.05rem;
    border-top: 1px solid var(--app-line);
    background: var(--app-card);
    position: relative;
    z-index: 100;
  }
  .tab-bar button {
    background: none; border: 0; display: flex; flex-direction: column;
    align-items: center; gap: 0.35rem; font-size: 0.65rem; font-weight: 600;
    color: var(--app-muted); font-family: inherit; cursor: pointer;
    transition: color 0.15s ease;
  }
  .tab-bar button.tab-active { color: var(--brand-dark); }
  .tab-bar button.tab-active span { font-weight: 700; }
  .tab-bar button.tab-active .fill-active { fill: currentColor; }
  .tab-bar .tab-icon {
    display: block;
    transition: transform 0.12s ease;
  }"""

# Define the new, slim, compact tab-bar css block
new_tab_bar_css = """  .tab-bar {
    flex: none;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 0.35rem 0.5rem 0.45rem; /* Slimmer padding for a sleeker profile */
    border-top: 1px solid var(--app-line);
    background: var(--app-card);
    position: relative;
    z-index: 100;
  }
  .tab-bar button {
    background: none; border: 0; display: flex; flex-direction: column;
    align-items: center; gap: 0.12rem; font-size: 0.58rem; font-weight: 600;
    color: var(--app-muted); font-family: inherit; cursor: pointer;
    transition: color 0.15s ease;
  }
  .tab-bar button.tab-active { color: var(--brand-dark); }
  .tab-bar button.tab-active span { font-weight: 700; }
  .tab-bar button.tab-active .fill-active { fill: currentColor; }
  .tab-bar .tab-icon {
    display: block;
    width: 1.15rem; /* ~18.5px icon size for maximum premium feel */
    height: 1.15rem;
    transition: transform 0.12s ease;
  }"""

content = content.replace(old_tab_bar_css, new_tab_bar_css)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully slimmed the bottom tab bar layout!")
