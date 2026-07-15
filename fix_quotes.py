import re

with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Screen 3 double quotes in SVG
screen3_bad = 'viewBox=\\"0 0 400 120\\" xmlns=\\"http://www.w3.org/2000/svg\\"'
screen3_good = "viewBox='0 0 400 120' xmlns='http://www.w3.org/2000/svg'"

# Also check for standard double quotes in the file
content = content.replace('viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg"', "viewBox='0 0 400 120' xmlns='http://www.w3.org/2000/svg'")
content = content.replace('stroke="%23fff" stroke-width="12"', "stroke='%23fff' stroke-width='12'")
content = content.replace('stroke="%23ced4da" stroke-width="8"', "stroke='%23ced4da' stroke-width='8'")
content = content.replace('fill="none"', "fill='none'")
content = content.replace('stroke="%23fff" stroke-width="16"', "stroke='%23fff' stroke-width='16'")
content = content.replace('stroke="%23d5e2da" stroke-width="12"', "stroke='%23d5e2da' stroke-width='12'")

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
