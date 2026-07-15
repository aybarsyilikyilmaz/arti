with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace artifact image names with local file names in the prototype folder
content = content.replace("manolya_cafe_1784057486309.jpg", "manolya.jpg")
content = content.replace("papatya_cafe_1784057494287.jpg", "papatya.jpg")

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)
