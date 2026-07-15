with open('frontend/src/components/Hero.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports to include useState and useEffect
content = content.replace("import React from 'react';", "import React, { useState, useEffect } from 'react';")

# 2. Define slogans right above the component export
old_export_start = "export default function Hero() {"
new_export_start = """const slogans = [
  { line1: "Gıdanı Kurtar,", line2: "Geleceği Koru." },
  { line1: "İşletmeni,", line2: "Artı'ya Taşı." },
  { line1: "İsrafı Önle,", line2: "Artı'ya Geç." }
];

export default function Hero() {"""

content = content.replace(old_export_start, new_export_start)

# 3. Add typewriter states and logic inside Hero component
old_component_body = """export default function Hero() {
  return (
    <div className="relative bg-brand overflow-hidden">"""

new_component_body = """export default function Hero() {
  const [sloganIndex, setSloganIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentSlogan = slogans[sloganIndex];
    const totalLength = currentSlogan.line1.length + currentSlogan.line2.length;
    
    let timer;
    
    if (!isDeleting) {
      // Typing phase
      if (charCount < totalLength) {
        timer = setTimeout(() => {
          setCharCount((prev) => prev + 1);
        }, 65); // Crisp typing speed (65ms per char)
      } else {
        // Pause at completion
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200); // 2.2s pause for reading
      }
    } else {
      // Deleting phase
      if (charCount > 0) {
        timer = setTimeout(() => {
          setCharCount((prev) => prev - 1);
        }, 30); // Faster delete speed (30ms per char)
      } else {
        // Swap slogan
        setIsDeleting(false);
        setSloganIndex((prev) => (prev + 1) % slogans.length);
      }
    }
    
    return () => clearTimeout(timer);
  }, [charCount, isDeleting, sloganIndex]);

  const currentSlogan = slogans[sloganIndex];
  let displayLine1 = "";
  let displayLine2 = "";

  if (charCount <= currentSlogan.line1.length) {
    displayLine1 = currentSlogan.line1.slice(0, charCount);
    displayLine2 = "";
  } else {
    displayLine1 = currentSlogan.line1;
    displayLine2 = currentSlogan.line2.slice(0, charCount - currentSlogan.line1.length);
  }

  return (
    <div className="relative bg-brand overflow-hidden">"""

content = content.replace(old_component_body, new_component_body)

# 4. Replace static h1 markup with typewriter h1 markup
old_h1_markup = """            <motion.h1
              variants={itemVariants}
              className="mt-6 text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl leading-tight drop-shadow-lg"
            >
              <span className="block mb-2">Gıdanı Kurtar,</span>
              <span className="block text-green-300">Geleceği Koru.</span>
            </motion.h1>"""

new_h1_markup = """            <motion.h1
              variants={itemVariants}
              className="mt-6 text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl leading-tight drop-shadow-lg min-h-[110px] sm:min-h-[140px] md:min-h-[170px]"
            >
              <span className="block mb-2">
                {displayLine1}
                {charCount <= currentSlogan.line1.length && (
                  <span className="inline-block text-green-300 font-light animate-pulse ml-1">|</span>
                )}
              </span>
              <span className="block text-green-300">
                {displayLine2}
                {charCount > currentSlogan.line1.length && (
                  <span className="inline-block text-white font-light animate-pulse ml-1">|</span>
                )}
              </span>
            </motion.h1>"""

content = content.replace(old_h1_markup, new_h1_markup)

with open('frontend/src/components/Hero.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully installed typewriter effect into Hero section!")
