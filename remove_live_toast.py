with open('frontend/src/components/Hero.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate and remove the absolute positioned LiveToast motion wrapper entirely
old_toast_block = """            {/* Canlı bildirim: 4 saniyede bir yenisi geliyor */}
            <motion.div
              className="absolute -left-16 top-24 z-10"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <LiveToast />
            </motion.div>"""

# Replace with empty string
content = content.replace(old_toast_block, "")

# Let's also check if there is a version with "8 saniyede bir yenisi geliyor" in the comment
old_toast_block_8s = """            {/* Canlı bildirim: 8 saniyede bir yenisi geliyor */}
            <motion.div
              className="absolute -left-16 top-24 z-10"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <LiveToast />
            </motion.div>"""

content = content.replace(old_toast_block_8s, "")

with open('frontend/src/components/Hero.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully removed LiveToast from Hero mockup area!")
