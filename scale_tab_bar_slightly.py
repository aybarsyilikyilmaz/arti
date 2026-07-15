with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the slim tab-bar css block
slim_tab_bar_css = """  .tab-bar {
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

# Define the goldilocks (slightly scaled up) tab-bar css block
goldilocks_tab_bar_css = """  .tab-bar {
    flex: none;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 0.45rem 0.5rem 0.65rem; /* Rebalanced goldilocks padding */
    border-top: 1px solid var(--app-line);
    background: var(--app-card);
    position: relative;
    z-index: 100;
  }
  .tab-bar button {
    background: none; border: 0; display: flex; flex-direction: column;
    align-items: center; gap: 0.22rem; font-size: 0.63rem; font-weight: 600;
    color: var(--app-muted); font-family: inherit; cursor: pointer;
    transition: color 0.15s ease;
  }
  .tab-bar button.tab-active { color: var(--brand-dark); }
  .tab-bar button.tab-active span { font-weight: 700; }
  .tab-bar button.tab-active .fill-active { fill: currentColor; }
  .tab-bar .tab-icon {
    display: block;
    width: 1.25rem; /* ~20px icon size for perfect readability */
    height: 1.25rem;
    transition: transform 0.12s ease;
  }"""

content = content.replace(slim_tab_bar_css, goldilocks_tab_bar_css)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully scaled the bottom tab bar slightly!")
