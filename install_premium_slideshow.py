with open('frontend/src/components/InfoSection.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports to include useSpring
content = content.replace(
    "import { useScroll, useTransform, motion } from 'framer-motion';",
    "import { useScroll, useTransform, useSpring, motion } from 'framer-motion';"
)

# 2. Update the scroll progress logic to include useSpring for buttery smooth animation
old_scroll_logic = """  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  // Maps vertical scroll progress (0.1 to 0.9) to horizontal translation (0% to -54% of track width)
  const x = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "-66%"]);"""

new_scroll_logic = """  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  // Smooth out the raw scroll progress using spring physics for a luxurious, fluid slide feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55, // Sweeping, elegant velocity
    damping: 20,    // Absorb velocity smoothly without bouncing
    mass: 0.8
  });

  // Mathematically maps the scroll to slide each card precisely to the viewport center
  const x = useTransform(smoothProgress, [0.12, 0.88], ["0%", "-66.6%"]);"""

content = content.replace(old_scroll_logic, new_scroll_logic)

# 3. Update the track classes (px-[10vw], gap-[20vw]) and card classes (w-[80vw], h-[560px])
old_track_block = """          {/* Horizontal Track holding the huge interactive step cards */}
          <div className="flex-1 flex items-center relative my-4">
            <motion.div style={{ x }} className="flex gap-16 md:gap-24 px-[5vw] md:px-[10vw]">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className="w-[90vw] md:w-[1000px] h-[480px] md:h-[520px] flex-none flex flex-col md:flex-row bg-white rounded-[2.5rem] border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
                >
                  {/* Step Description */}
                  <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-between h-[50%] md:h-full">"""

new_track_block = """          {/* Horizontal Track holding the huge interactive step cards */}
          <div className="flex-1 flex items-center relative my-4">
            <motion.div style={{ x }} className="flex gap-[20vw] px-[10vw]">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className="w-[80vw] h-[400px] sm:h-[480px] md:h-[520px] lg:h-[560px] flex-none flex flex-col md:flex-row bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 relative"
                >
                  {/* Step Description */}
                  <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-between h-[50%] md:h-full">"""

content = content.replace(old_track_block, new_track_block)

with open('frontend/src/components/InfoSection.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated InfoSection to a mathematical premium slideshow with spring smoothing!")
