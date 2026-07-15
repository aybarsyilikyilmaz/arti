with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Circle K with Beyaz Fırın - Bahariye
content = content.replace("<!-- Card 1: Circle K -->", "<!-- Card 1: Beyaz Fırın -->")
content = content.replace("Circle K - Bahariye", "Beyaz Fırın - Bahariye")

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully changed name to Beyaz Fırın!")
