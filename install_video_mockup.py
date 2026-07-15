with open('frontend/src/components/Hero.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate the old mockup phone block
old_mockup_inner = """            <motion.div
              className="relative w-[340px] h-[737px] bg-brand-dark rounded-[3rem] border-[9px] border-gray-900/80 shadow-2xl"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
                <div className="w-24 h-5 bg-gray-900/80 rounded-b-2xl"></div>
              </div>
              <div className="h-full w-full rounded-[2.4rem] overflow-hidden bg-white flex flex-col">
                <div className="bg-brand px-5 pt-8 pb-6 text-white">
                  <p className="text-xs text-green-200">Yakınında</p>
                  <p className="text-lg font-bold">Sürpriz Kutular</p>
                </div>

                {/* Liste kartları: sırayla (stagger) yerine oturuyor */}
                <motion.div
                  className="flex-1 p-4 space-y-3 overflow-hidden"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    { name: 'Fırın Keyfi', dist: '350 m', price: '49\u20ba', old: '150\u20ba' },
                    { name: 'Yeşil Market', dist: '700 m', price: '65\u20ba', old: '195\u20ba' },
                    { name: 'Cafe Roma', dist: '1.1 km', price: '55\u20ba', old: '160\u20ba' },
                  ].map((item) => (
                    <motion.div
                      key={item.name}
                      variants={listItemVariants}
                      className="bg-gray-50 border border-gray-100 rounded-2xl p-3 flex items-center gap-3"
                    >
                      <div className="h-12 w-12 rounded-xl bg-brand-light flex items-center justify-center text-brand font-bold">
                        {item.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{item.dist} \u00b7 <Clock className="h-3 w-3" />19:00-21:00</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-brand">{item.price}</p>
                        <p className="text-[11px] text-gray-400 line-through">{item.old}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>"""

# Define the new mockup phone block with autoplaying video
new_mockup_inner = """            <motion.div
              className="relative w-[340px] h-[737px] bg-brand-dark rounded-[3rem] border-[9px] border-gray-900/80 shadow-2xl"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              {/* Phone Notch Overlay */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-10">
                <div className="w-24 h-5 bg-gray-900/80 rounded-b-2xl"></div>
              </div>
              
              {/* Phone Screen Area playing the screen recording */}
              <div className="h-full w-full rounded-[2.4rem] overflow-hidden bg-white relative">
                <video
                  src="/artıvideo.mov"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ display: 'block' }}
                />
              </div>
            </motion.div>"""

content = content.replace(old_mockup_inner, new_mockup_inner)

with open('frontend/src/components/Hero.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully replaced static cards mockup with the autoplaying video!")
