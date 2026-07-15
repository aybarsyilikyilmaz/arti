with open('prototype/app-prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate body.recording-mode CSS block
old_recording_body = """  body.recording-mode {
    background: #ffffff !important;
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }"""

# Add cursor: none to hide it completely inside the window
new_recording_body = """  body.recording-mode {
    background: #ffffff !important;
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    cursor: none !important; /* Hides mouse cursor completely inside the window when in recording mode */
  }
  body.recording-mode * {
    cursor: none !important; /* Force hide cursor on all child elements/buttons */
  }"""

content = content.replace(old_recording_body, new_recording_body)

with open('prototype/app-prototype.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully injected cursor-hide styles for recording mode!")
