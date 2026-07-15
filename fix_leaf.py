import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the bad leaf SVG
bad_svg = r"""<svg width="60" height="60" viewBox="0 0 24 24" fill="#388E3C" style="margin-bottom: 1rem;"><path d="M12 22s-8-4\.5-8-11\.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8\.2c0 7\.3-8 11\.8-8 11\.8z"/><path d="M12 22v-9" stroke="#fff" stroke-width="2"/></svg>"""

good_svg = """<svg width="60" height="60" viewBox="0 0 512 512" fill="#388E3C" style="margin-bottom: 1rem;"><path d="M512 32c0-17.6-14.4-32-32-32H384C171.9 0 0 171.9 0 384c0 31.9 4.6 62.7 13.1 92.1l-10.3 10.3c-3.7 3.7-3.7 9.8 0 13.5l10.8 10.8c3.7 3.7 9.8 3.7 13.5 0l10.3-10.3C66.8 508.9 97.6 512 128 512c212.1 0 384-171.9 384-384V32zM337.8 193.3L153.2 377.9c-3.7 3.7-9.8 3.7-13.5 0l-10.8-10.8c-3.7-3.7-3.7-9.8 0-13.5l184.6-184.6c3.7-3.7 9.8-3.7 13.5 0l10.8 10.8c3.8 3.7 3.8 9.8 0 13.5z"/></svg>"""
content = re.sub(bad_svg, good_svg, content)

# Replace the text
bad_text = "1,2 kg CO₂ tasarrufu yaptınız!"
good_text = "Bu sipariş ile 1.2kg CO₂ tasarrufu yapacaksınız."
content = content.replace(bad_text, good_text)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
