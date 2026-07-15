import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix CSS
css_search = r"""  \.action-btn \{
    width: 100%; background: #0b5942;
    color: #fff; border: none; border-radius: 999px; padding: 1.1rem;
    font-size: 1rem; font-weight: 700; cursor: pointer;
  \}"""
css_replace = """  .action-btn {
    width: 100%; background: #0b5942;
    color: #fff; border: none; border-radius: 999px; padding: 1.1rem;
    font-size: 1rem; font-weight: 700; cursor: pointer;
    transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.15s ease, opacity 0.15s ease;
  }
  .action-btn:hover {
    background: #0a4f3b;
  }
  .action-btn:active {
    transform: scale(0.95);
    background: #084030;
    opacity: 0.9;
  }"""

content = re.sub(css_search, css_replace, content)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
