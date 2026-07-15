with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace .tab-bar style to have position relative and z-index 100
old_tab_style = """  .tab-bar {
    flex: none;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 0.55rem 0.5rem 1.05rem;
    border-top: 1px solid var(--app-line);
    background: var(--app-card);
  }"""

new_tab_style = """  .tab-bar {
    flex: none;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    padding: 0.55rem 0.5rem 1.05rem;
    border-top: 1px solid var(--app-line);
    background: var(--app-card);
    position: relative;
    z-index: 100;
  }"""

content = content.replace(old_tab_style, new_tab_style)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
