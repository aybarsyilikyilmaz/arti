with open('frontend/src/components/Hero.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Slow down the LiveToast rotation interval to 8000ms
content = content.replace(
    "const t = setInterval(() => setIndex((p) => (p + 1) % liveEvents.length), 3800);",
    "const t = setInterval(() => setIndex((p) => (p + 1) % liveEvents.length), 8000);"
)

# 2. Update the CountUp stats values
content = content.replace(
    "<CountUp end={10240} />+",
    "<CountUp end={100} />+"
)
content = content.replace(
    "<CountUp end={850} />+",
    "<CountUp end={20} />+"
)
content = content.replace(
    "<CountUp end={14} /> ton",
    "<CountUp end={1} /> ton"
)

with open('frontend/src/components/Hero.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated notification interval and adjusted stats!")
