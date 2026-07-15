with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Beyaz Fırın with a fictional premium name: Maya & Un
content = content.replace("<!-- Card 1: Beyaz Fırın -->", "<!-- Card 1: Maya & Un -->")
content = content.replace("Beyaz Fırın - Bahariye", "Maya & Un - Bahariye")

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully renamed to Maya & Un!")
