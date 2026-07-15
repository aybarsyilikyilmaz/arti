with open('frontend/src/components/Hero.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the mockup dimensions to match the prototype's 340px width and proportional height exactly
old_div = 'className="relative w-[340px] h-[660px] bg-brand-dark rounded-[3rem] border-[8px] border-gray-900/80 shadow-2xl"'
new_div = 'className="relative w-[340px] h-[737px] bg-brand-dark rounded-[3rem] border-[9px] border-gray-900/80 shadow-2xl"'

content = content.replace(old_div, new_div)

with open('frontend/src/components/Hero.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully aligned landing page mockup dimensions to match prototype exactly!")
