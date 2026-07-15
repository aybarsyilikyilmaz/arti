with open('frontend/src/components/InfoSection.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update horizontal translation range in useTransform to support wider cards and translation
content = content.replace(
    'const x = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "-54%"]);',
    'const x = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "-66%"]);'
)

# 2. Update the horizontal track padding and gaps, and card sizing and padding
old_track_block = """          {/* Horizontal Track holding the huge interactive step cards */}
          <div className="flex-1 flex items-center relative my-4">
            <motion.div style={{ x }} className="flex gap-8 md:gap-12 px-[10vw] md:px-[20vw]">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className="w-[82vw] md:w-[620px] h-[380px] md:h-[400px] flex-none flex flex-col md:flex-row bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 relative"
                >
                  {/* Step Description */}
                  <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between h-[55%] md:h-full">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-10 w-10 rounded-full bg-brand-light text-brand">
                          <step.icon className="h-5 w-5" />
                        </span>
                        <span className="text-4xl font-extrabold text-brand-light">{step.num}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mt-4">{step.name}</h3>
                      <p className="mt-2 md:mt-3 text-xs md:text-sm text-gray-500 leading-relaxed">{step.description}</p>
                    </div>"""

new_track_block = """          {/* Horizontal Track holding the huge interactive step cards */}
          <div className="flex-1 flex items-center relative my-4">
            <motion.div style={{ x }} className="flex gap-16 md:gap-24 px-[5vw] md:px-[10vw]">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className="w-[90vw] md:w-[1000px] h-[480px] md:h-[520px] flex-none flex flex-col md:flex-row bg-white rounded-[2.5rem] border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
                >
                  {/* Step Description */}
                  <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-between h-[50%] md:h-full">
                    <div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-light text-brand">
                          <step.icon className="h-6 w-6" />
                        </span>
                        <span className="text-5xl font-extrabold text-brand-light">{step.num}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-6">{step.name}</h3>
                      <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-500 leading-relaxed">{step.description}</p>
                    </div>"""

content = content.replace(old_track_block, new_track_block)

with open('frontend/src/components/InfoSection.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully enlarged scroll cards and adjusted horizontal track translation!")
